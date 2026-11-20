/* =========================================================
   Nova · Site logic (shared by index.html and mine.html)
   You only need to edit the CONFIG block.
   ========================================================= */
const CONFIG = {
  NAME: "Nova",
  SYMBOL: "NOVA",
  DECIMALS: 18,

  // 👇 Paste the address Remix gives you after deploying (starts with 0x...)
  CONTRACT_ADDRESS: "",

  // "baseSepolia" to test for free, "base" for the real network
  // ("localhost" is only for development with a local node)
  NETWORK: "base",

  // Logo sent to MetaMask when the user clicks "Add to MetaMask"
  LOGO: "logo.png",
};

const NETWORKS = {
  base: {
    chainId: 8453,
    name: "Base",
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
  },
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia (testnet)",
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
  },
  localhost: {
    chainId: 31337,
    name: "Localhost",
    rpc: "http://127.0.0.1:8545",
    explorer: "",
  },
};

// Contract functions and events used by the site (ABI)
const ABI = [
  "function mine()",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function REWARD() view returns (uint256)",
  "function COOLDOWN() view returns (uint256)",
  "function totalMiners() view returns (uint256)",
  "function totalMines() view returns (uint256)",
  "function lastMine(address) view returns (uint256)",
  "function nextMineTime(address) view returns (uint256)",
  "event Mined(address indexed miner, uint256 amount)",
];

/* ---------- State ---------- */
const net = NETWORKS[CONFIG.NETWORK];
const configured = /^0x[a-fA-F0-9]{40}$/.test(CONFIG.CONTRACT_ADDRESS);
let readContract = null; // reads data without a wallet
let signer = null;
let account = null;
let nextMine = 0;        // timestamp (seconds) of the next allowed mine
let lastMined = 0;       // timestamp (seconds) of this wallet's last mine
let cooldown = 86400;    // seconds between mines (read from the contract)
let busy = false;

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };
const on = (id, ev, fn) => $(id)?.addEventListener(ev, fn);
const fmt = (n, d = 0) => Number(n).toLocaleString("en-US", { maximumFractionDigits: d });
const units = (v) => Number(ethers.formatUnits(v, CONFIG.DECIMALS));
const short = (a) => a.slice(0, 6) + "…" + a.slice(-4);
const now = () => Math.floor(Date.now() / 1000);
const link = (path) => (net.explorer ? `${net.explorer}/${path}` : "#");

function timeAgo(sec) {
  const s = Math.max(0, now() - sec);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " h ago";
  return Math.floor(s / 86400) + " d ago";
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", init);

function init() {
  // Fill in the name and symbol across the page
  document.querySelectorAll("[data-name]").forEach((el) => (el.textContent = CONFIG.NAME));
  document.querySelectorAll("[data-symbol]").forEach((el) => (el.textContent = CONFIG.SYMBOL));
  document.querySelectorAll("[data-network]").forEach((el) => (el.textContent = net.name));
  setText("networkName", net.name);

  const contractUrl = configured ? link(`address/${CONFIG.CONTRACT_ADDRESS}`) : "#";
  document.querySelectorAll("[data-contract-link]").forEach((a) => (a.href = contractUrl));

  on("connectBtn", "click", connect);
  on("mineBtn", "click", mine);
  on("addTokenBtn", "click", addToWallet);

  if (typeof ethers === "undefined") {
    setStatus("Couldn’t load the ethers.js library. Check your internet connection.", "error");
    return;
  }

  if (!configured) {
    $("configBanner")?.classList.remove("hidden");
    setStatus("The contract isn’t configured yet.", "error");
    setFeedEmpty("Recent mines will appear here once the contract is live.");
    return;
  }

  const rpc = new ethers.JsonRpcProvider(net.rpc, net.chainId, { staticNetwork: true });
  readContract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, rpc);

  refreshStats();
  refreshFeed();
  setInterval(refreshStats, 15000);
  setInterval(refreshFeed, 30000);
  setInterval(tick, 1000);

  // If the wallet was already connected before, reconnect without prompting
  if (window.ethereum) {
    window.ethereum.request({ method: "eth_accounts" }).then((accs) => accs.length && connect());
    window.ethereum.on?.("accountsChanged", () => location.reload());
    window.ethereum.on?.("chainChanged", () => location.reload());
  }
}

/* ---------- Wallet ---------- */
async function connect() {
  if (!window.ethereum) {
    setStatus("MetaMask not detected. Install it from metamask.io and reload the page.", "error");
    window.open("https://metamask.io/download/", "_blank");
    return;
  }
  if (!configured) return toast("Set the contract address in app.js first");

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await ensureNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    account = await signer.getAddress();

    const btn = $("connectBtn");
    if (btn) {
      btn.textContent = short(account);
      btn.setAttribute("aria-label", "Wallet connected: " + account);
      btn.classList.add("connected");
    }
    document.body.classList.add("is-connected");
    setStatus("Ready. Each wallet can mine once every 24 hours.");

    await refreshUser();
    refreshFeed();
  } catch (err) {
    console.error(err);
    setStatus(niceError(err), "error");
  }
}

async function ensureNetwork() {
  const hexId = "0x" + net.chainId.toString(16);
  const current = await window.ethereum.request({ method: "eth_chainId" });
  if (current === hexId) return;
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: hexId }] });
  } catch (err) {
    if (err.code === 4902) {
      // The network isn't in MetaMask yet: add it
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: hexId,
          chainName: net.name,
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: [net.rpc],
          blockExplorerUrls: net.explorer ? [net.explorer] : [],
        }],
      });
    } else {
      throw err;
    }
  }
}

/* ---------- Mine ---------- */
async function mine() {
  if (!signer || busy) return;
  busy = true;
  const btn = $("mineBtn");
  btn.disabled = true;
  btn.classList.add("working");
  setText("mineLabel", "Confirm in MetaMask…");
  setStatus("Check the MetaMask window and confirm the transaction.");

  try {
    const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.mine();
    setText("mineLabel", "Mining…");
    const view = net.explorer ? ` <a href="${link("tx/" + tx.hash)}" target="_blank" rel="noopener">view</a>` : "";
    setStatus(`Transaction sent. Waiting for confirmation…${view}`);
    await tx.wait();

    celebrate();
    setStatus(`You mined ${fmt(units(await readContract.REWARD()))} ${CONFIG.SYMBOL}! Come back in 24 h.`, "ok");
    toast("⛏️ Mined successfully!");
    await Promise.all([refreshUser(), refreshStats(), refreshFeed()]);
  } catch (err) {
    console.error(err);
    setStatus(niceError(err), "error");
  } finally {
    busy = false;
    btn.classList.remove("working");
    updateMineButton();
  }
}

/* ---------- Add to MetaMask (with logo) ---------- */
async function addToWallet() {
  if (!window.ethereum) return toast("You need MetaMask");
  if (!configured) return toast("Contract not configured");
  try {
    await ensureNetwork();
    const added = await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: CONFIG.CONTRACT_ADDRESS,
          symbol: CONFIG.SYMBOL,
          decimals: CONFIG.DECIMALS,
          image: new URL(CONFIG.LOGO, location.href).href,
        },
      },
    });
    if (added) toast(`🦊 ${CONFIG.SYMBOL} added to your wallet`);
  } catch (err) {
    console.error(err);
    toast(niceError(err));
  }
}

/* ---------- Data ---------- */
function setStat(name, value) {
  document.querySelectorAll(`[data-stat="${name}"]`).forEach((el) => (el.textContent = value));
}

async function refreshStats() {
  try {
    const [supply, max, miners, mines, reward, cd] = await Promise.all([
      readContract.totalSupply(),
      readContract.MAX_SUPPLY(),
      readContract.totalMiners(),
      readContract.totalMines(),
      readContract.REWARD(),
      readContract.COOLDOWN(),
    ]);
    const s = units(supply), m = units(max);
    const pct = m ? (s / m) * 100 : 0;
    cooldown = Number(cd) || cooldown;

    setStat("supply", fmt(s));
    setStat("max", fmt(m));
    setStat("remaining", fmt(m - s));
    setStat("miners", fmt(miners));
    setStat("mines", fmt(mines));
    setStat("pct", fmt(pct, pct < 1 ? 3 : 1) + "%");
    setText("progressPct", fmt(pct, pct < 1 ? 3 : 1) + "%");
    document.querySelectorAll("[data-progress]").forEach((el) => (el.style.width = Math.max(pct, 0.5) + "%"));
    document.querySelectorAll("[data-reward]").forEach((el) => (el.textContent = fmt(units(reward))));

    if (s >= m) {
      nextMine = Infinity;
      updateMineButton();
    }
  } catch (err) {
    console.error("Error reading stats", err);
  }
}

async function refreshUser() {
  if (!account) return;
  const [bal, next, last] = await Promise.all([
    readContract.balanceOf(account),
    readContract.nextMineTime(account),
    readContract.lastMine(account),
  ]);
  setText("balance", fmt(units(bal), 2));
  lastMined = Number(last);
  setText("lastMined", lastMined ? timeAgo(lastMined) : "Never");
  if (nextMine !== Infinity) nextMine = Number(next);
  updateMineButton();
}

/* ---------- Recent mines (mine.html) ---------- */
function setFeedEmpty(msg) {
  const feed = $("feed");
  if (feed) feed.innerHTML = `<li class="feed-empty">${msg}</li>`;
}

async function refreshFeed() {
  const feed = $("feed");
  if (!feed || !readContract) return;
  try {
    const provider = readContract.runner;
    const latest = await provider.getBlockNumber();
    let events = [];
    // Public RPCs limit how many blocks one query can cover, so try a wide range first
    for (const range of [9000, 2000]) {
      try {
        events = await readContract.queryFilter(readContract.filters.Mined(), Math.max(0, latest - range), latest);
        break;
      } catch (_) { /* try a smaller range */ }
    }
    const recent = events.slice(-6).reverse();
    if (!recent.length) return setFeedEmpty("No mines in the last few hours. Be the first!");

    const blocks = await Promise.all(recent.map((e) => provider.getBlock(e.blockNumber)));
    feed.innerHTML = recent.map((e, i) => {
      const who = e.args.miner;
      const you = account && who.toLowerCase() === account.toLowerCase();
      const href = link("tx/" + e.transactionHash);
      return `<li${you ? ' class="is-you"' : ""}>
        <a href="${href}" target="_blank" rel="noopener">
          <span class="feed-dot" aria-hidden="true"></span>
          <span class="feed-who">${you ? "You" : short(who)}</span>
          <span class="feed-amt">+${fmt(units(e.args.amount))} ${CONFIG.SYMBOL}</span>
          <time class="feed-time">${blocks[i] ? timeAgo(blocks[i].timestamp) : ""}</time>
        </a></li>`;
    }).join("");
  } catch (err) {
    console.error("Error reading recent mines", err);
    setFeedEmpty("Couldn’t load recent mines right now.");
  }
}

/* ---------- Button, countdown and cooldown ring ---------- */
function tick() {
  if (account && !busy) updateMineButton();
}

function setRing(fraction) {
  const ring = $("cooldownRing");
  if (!ring) return;
  ring.style.strokeDashoffset = String(100 - Math.max(0, Math.min(1, fraction)) * 100);
  ring.closest(".ring")?.classList.toggle("is-ready", fraction >= 1);
  ring.closest(".ring")?.classList.toggle("is-empty", fraction <= 0.001);
}

function updateMineButton() {
  const btn = $("mineBtn");
  if (busy || !btn) return;
  if (!account) {
    btn.disabled = true;
    setText("mineLabel", "Connect your wallet");
    setText("nextMineText", "—");
    setRing(0);
    return;
  }
  if (nextMine === Infinity) {
    btn.disabled = true;
    setText("mineLabel", "Supply exhausted");
    setText("nextMineText", "Never: all mined");
    setRing(0);
    return;
  }
  const left = nextMine - now();
  if (left > 0) {
    btn.disabled = true;
    setText("mineLabel", "Next mine in " + countdown(left));
    setText("nextMineText", countdown(left));
    setRing(1 - left / cooldown);
  } else {
    btn.disabled = false;
    setText("mineLabel", "Mine");
    setText("nextMineText", "Ready now");
    setRing(1);
  }
  if (lastMined) setText("lastMined", timeAgo(lastMined));
}

function countdown(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
}

/* ---------- Effects ---------- */
function celebrate() {
  // 3D coin spin (defined in motion.js / mine.js)
  if (typeof window.novaCelebrate === "function") window.novaCelebrate();

  const box = $("particles");
  if (!box) return;
  const reward = document.querySelector("[data-reward]")?.textContent || "100";
  for (let i = 0; i < 7; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.textContent = i === 0 ? `+${reward} ${CONFIG.SYMBOL}` : "+";
    p.style.setProperty("--dx", (Math.random() * 200 - 100) + "px");
    p.style.animationDelay = i * 0.07 + "s";
    p.style.fontSize = i === 0 ? "1.5rem" : (0.9 + Math.random() * 0.7) + "rem";
    box.appendChild(p);
    setTimeout(() => p.remove(), 2200);
  }
}

function setStatus(html, type = "") {
  const el = $("mineStatus");
  if (!el) return;
  el.innerHTML = html;
  el.className = "mine-status " + type;
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}

/* ---------- Human-friendly error messages ---------- */
function niceError(err) {
  const msg = (err?.shortMessage || err?.reason || err?.message || "").toLowerCase();
  if (err?.code === 4001 || err?.code === "ACTION_REJECTED" || msg.includes("rejected"))
    return "You cancelled the transaction.";
  if (msg.includes("insufficient funds"))
    return `You don’t have enough ETH on ${net.name} to pay for gas. A few cents is enough.`;
  if (msg.includes("wait 24h")) return "It hasn’t been 24 h since your last mine yet.";
  if (msg.includes("max supply")) return "The whole supply has already been mined.";
  return "Something went wrong: " + (err?.shortMessage || err?.message || "unknown error");
}
