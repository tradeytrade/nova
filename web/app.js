/* =========================================================
   Nova · Site logic
   You only need to edit the CONFIG block.
   ========================================================= */
const CONFIG = {
  NAME: "Nova",
  SYMBOL: "NOVA",
  DECIMALS: 18,

  // 👇 Paste the address Remix gives you after deploying (starts with 0x...)
  CONTRACT_ADDRESS: "",

  // "baseSepolia" to test for free, "base" for the real network
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
};

// Contract functions used by the site (ABI)
const ABI = [
  "function mine()",
  "function balanceOf(address) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function REWARD() view returns (uint256)",
  "function totalMiners() view returns (uint256)",
  "function totalMines() view returns (uint256)",
  "function nextMineTime(address) view returns (uint256)",
];

/* ---------- State ---------- */
const net = NETWORKS[CONFIG.NETWORK];
const configured = /^0x[a-fA-F0-9]{40}$/.test(CONFIG.CONTRACT_ADDRESS);
let readContract = null; // reads data without a wallet
let signer = null;
let account = null;
let nextMine = 0; // timestamp (seconds) of the next allowed mine
let busy = false;

const $ = (id) => document.getElementById(id);
const fmt = (n, d = 0) => Number(n).toLocaleString("en-US", { maximumFractionDigits: d });
const units = (v) => Number(ethers.formatUnits(v, CONFIG.DECIMALS));
const short = (a) => a.slice(0, 6) + "…" + a.slice(-4);

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", init);

function init() {
  // Fill in the name and symbol across the page
  document.querySelectorAll("[data-name]").forEach((el) => (el.textContent = CONFIG.NAME));
  document.querySelectorAll("[data-symbol]").forEach((el) => (el.textContent = CONFIG.SYMBOL));
  $("networkName").textContent = net.name;

  const contractUrl = configured ? `${net.explorer}/address/${CONFIG.CONTRACT_ADDRESS}` : "#";
  $("explorerLink").href = contractUrl;
  $("footerContract").href = contractUrl;

  $("connectBtn").addEventListener("click", connect);
  $("mineBtn").addEventListener("click", mine);
  $("addTokenBtn").addEventListener("click", addToWallet);

  if (typeof ethers === "undefined") {
    setStatus("Couldn’t load the ethers.js library. Check your internet connection.", "error");
    return;
  }

  if (!configured) {
    $("configBanner").classList.remove("hidden");
    setStatus("The contract isn’t configured yet.", "error");
    return;
  }

  const rpc = new ethers.JsonRpcProvider(net.rpc, net.chainId, { staticNetwork: true });
  readContract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, rpc);

  refreshStats();
  setInterval(refreshStats, 15000);
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
    btn.textContent = short(account);
    btn.setAttribute("aria-label", "Wallet connected: " + account);
    btn.classList.add("connected");

    await refreshUser();
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
          blockExplorerUrls: [net.explorer],
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
  $("mineLabel").textContent = "Confirm in MetaMask…";
  setStatus("Check the MetaMask window and confirm the transaction.");

  try {
    const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.mine();
    $("mineLabel").textContent = "Mining…";
    setStatus(`Transaction sent. Waiting for confirmation… <a href="${net.explorer}/tx/${tx.hash}" target="_blank" rel="noopener">view</a>`);
    await tx.wait();

    celebrate();
    setStatus(`You mined ${fmt(units(await readContract.REWARD()))} ${CONFIG.SYMBOL}! Come back in 24 h.`, "ok");
    toast("⛏️ Mined successfully!");
    await Promise.all([refreshUser(), refreshStats()]);
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
    const [supply, max, miners, mines, reward] = await Promise.all([
      readContract.totalSupply(),
      readContract.MAX_SUPPLY(),
      readContract.totalMiners(),
      readContract.totalMines(),
      readContract.REWARD(),
    ]);
    const s = units(supply), m = units(max);
    const pct = m ? (s / m) * 100 : 0;

    setStat("supply", fmt(s));
    setStat("max", fmt(m));
    setStat("remaining", fmt(m - s));
    setStat("miners", fmt(miners));
    setStat("mines", fmt(mines));
    $("progressPct").textContent = fmt(pct, pct < 1 ? 3 : 1) + "%";
    $("progressBar").style.width = Math.max(pct, 0.5) + "%";
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
  const [bal, next] = await Promise.all([
    readContract.balanceOf(account),
    readContract.nextMineTime(account),
  ]);
  $("balance").textContent = fmt(units(bal), 2);
  if (nextMine !== Infinity) nextMine = Number(next);
  updateMineButton();
}

/* ---------- Button and countdown ---------- */
function tick() {
  if (account && !busy) updateMineButton();
}

function updateMineButton() {
  const btn = $("mineBtn"), label = $("mineLabel");
  if (busy) return;
  if (!account) {
    btn.disabled = true;
    label.textContent = "Connect your wallet";
    return;
  }
  if (nextMine === Infinity) {
    btn.disabled = true;
    label.textContent = "Supply exhausted";
    return;
  }
  const left = nextMine - Math.floor(Date.now() / 1000);
  if (left > 0) {
    btn.disabled = true;
    label.textContent = "Next mine in " + countdown(left);
  } else {
    btn.disabled = false;
    label.textContent = "Mine";
  }
}

function countdown(sec) {
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
}

/* ---------- Effects ---------- */
function celebrate() {
  // 3D coin spin (defined in motion.js)
  if (typeof window.novaCelebrate === "function") window.novaCelebrate();

  const box = $("particles");
  const reward = document.querySelector("[data-reward]").textContent;
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
  el.innerHTML = html;
  el.className = "mine-status " + type;
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
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
