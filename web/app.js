/* =========================================================
   Nova · Site logic (shared by index.html and mine.html)
   You only need to edit the CONFIG block.
   Texts live in i18n.js (English, Spanish, French).
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
let balance = null;      // this wallet's balance (in NOVA)
let busy = false;
let busyLabel = "";      // translation key shown on the button while busy
let stats = null;        // last numbers read from the contract
let feedState = { empty: "feed.loading" }; // or { items: [...] }
let feedSeen = null;     // tx hashes already shown, to animate only new ones
let statusState = null;  // { key, vars, type } of the message under the button

/* ---------- Helpers ---------- */
const $ = (id) => document.getElementById(id);
const setText = (id, v) => { const el = $(id); if (el) el.textContent = v; };
const on = (id, ev, fn) => $(id)?.addEventListener(ev, fn);
const T = (key, vars) => (window.I18N ? I18N.t(key, vars) : key);
const locale = () => (window.I18N ? I18N.locale : "en-US");
const fmt = (n, d = 0) => Number(n).toLocaleString(locale(), { maximumFractionDigits: d });
const units = (v) => Number(ethers.formatUnits(v, CONFIG.DECIMALS));
const short = (a) => a.slice(0, 6) + "…" + a.slice(-4);
const now = () => Math.floor(Date.now() / 1000);
const link = (path) => (net.explorer ? `${net.explorer}/${path}` : "#");
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function timeAgo(sec) {
  const s = Math.max(0, now() - sec);
  if (s < 60) return T("ago.now");
  if (s < 3600) return T("ago.min", { n: Math.floor(s / 60) });
  if (s < 86400) return T("ago.h", { n: Math.floor(s / 3600) });
  return T("ago.d", { n: Math.floor(s / 86400) });
}

// Shows a number, counting up (or down) from the previous value
function showNum(el, value, d = 0, suffix = "", animate = true) {
  if (!el) return;
  cancelAnimationFrame(el._raf);
  const from = el._v ?? 0;
  el._v = value;
  if (!animate || calm || from === value) { el.textContent = fmt(value, d) + suffix; return; }
  const t0 = performance.now(), dur = 1200;
  const step = (t) => {
    const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
    el.textContent = fmt(from + (value - from) * e, d) + suffix;
    if (p < 1) el._raf = requestAnimationFrame(step);
  };
  el._raf = requestAnimationFrame(step);
}

/* ---------- Start ---------- */
document.addEventListener("DOMContentLoaded", init);

function fillNames() {
  document.querySelectorAll("[data-name]").forEach((el) => (el.textContent = CONFIG.NAME));
  document.querySelectorAll("[data-symbol]").forEach((el) => (el.textContent = CONFIG.SYMBOL));
  document.querySelectorAll("[data-network]").forEach((el) => (el.textContent = net.name));
  if (window.I18N) document.querySelectorAll("[data-reward]").forEach((el) => (el.textContent = I18N.vars.reward));
}

function init() {
  if (window.I18N) Object.assign(I18N.vars, { name: CONFIG.NAME, symbol: CONFIG.SYMBOL, network: net.name });
  fillNames();

  const contractUrl = configured ? link(`address/${CONFIG.CONTRACT_ADDRESS}`) : "#";
  document.querySelectorAll("[data-contract-link]").forEach((a) => (a.href = contractUrl));

  on("connectBtn", "click", connect);
  on("mineBtn", "click", mine);
  on("addTokenBtn", "click", addToWallet);
  document.addEventListener("nova:lang", onLanguage);

  renderConnect();
  renderStats(false);
  renderFeed();
  updateMineButton();
  setStatus("st.need");

  if (typeof ethers === "undefined") return setStatus("st.ethers", null, "error");

  if (!configured) {
    $("configBanner")?.classList.remove("hidden");
    setStatus("st.notConfigured", null, "error");
    feedState = { empty: "feed.notLive" };
    renderFeed();
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

// Re-draw everything the scripts write when the language changes
function onLanguage() {
  fillNames();
  renderConnect();
  renderStats(false);
  renderFeed();
  renderStatus();
  if (balance !== null) showNum($("balance"), balance, 2, "", false);
  if (busy) setText("mineLabel", T(busyLabel));
  else updateMineButton();
  if (!account || !lastMined) setText("lastMined", account ? T("never") : "—");
}

/* ---------- Wallet ---------- */
function renderConnect() {
  const btn = $("connectBtn");
  if (!btn) return;
  if (account) {
    btn.textContent = short(account);
    btn.setAttribute("aria-label", T("connect.aria", { account }));
  } else {
    btn.innerHTML = `<span class="lbl-long">${T("connect.long")}</span><span class="lbl-short">${T("connect.short")}</span>`;
    btn.removeAttribute("aria-label");
  }
}

async function connect() {
  if (!window.ethereum) {
    setStatus("st.noMetamask", null, "error");
    window.open("https://metamask.io/download/", "_blank");
    return;
  }
  if (!configured) return toast(T("toast.setAddress"));

  try {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    await ensureNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    account = await signer.getAddress();

    $("connectBtn")?.classList.add("connected");
    renderConnect();
    document.body.classList.add("is-connected");
    setStatus("st.ready");

    await refreshUser();
    refreshFeed();
  } catch (err) {
    console.error(err);
    setStatus(...niceError(err), "error");
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
  busyLabel = "btn.confirm";
  setText("mineLabel", T(busyLabel));
  setStatus("st.confirm");

  try {
    const contract = new ethers.Contract(CONFIG.CONTRACT_ADDRESS, ABI, signer);
    const tx = await contract.mine();
    busyLabel = "btn.mining";
    setText("mineLabel", T(busyLabel));
    const href = link("tx/" + tx.hash);
    const view = () => (net.explorer ? ` <a href="${href}" target="_blank" rel="noopener">${T("st.view")}</a>` : "");
    setStatus("st.sent", { view });
    await tx.wait();

    celebrate();
    const amount = fmt(units(await readContract.REWARD()));
    setStatus("st.mined", { amount, symbol: CONFIG.SYMBOL }, "ok");
    toast(T("toast.mined"));
    await Promise.all([refreshUser(), refreshStats(), refreshFeed()]);
  } catch (err) {
    console.error(err);
    setStatus(...niceError(err), "error");
  } finally {
    busy = false;
    btn.classList.remove("working");
    updateMineButton();
  }
}

/* ---------- Add to MetaMask (with logo) ---------- */
async function addToWallet() {
  if (!window.ethereum) return toast(T("toast.needMM"));
  if (!configured) return toast(T("toast.notConfigured"));
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
    if (added) toast(T("toast.added", { symbol: CONFIG.SYMBOL }));
  } catch (err) {
    console.error(err);
    const [key, vars] = niceError(err);
    toast(T(key, { ...vars, network: net.name }).replace(/<[^>]+>/g, ""));
  }
}

/* ---------- Data ---------- */
function eachStat(name, fn) {
  document.querySelectorAll(`[data-stat="${name}"]`).forEach(fn);
}

function renderStats(animate = true) {
  if (!stats) {
    eachStat("max", (el) => showNum(el, 1_000_000, 0, "", false));
    return;
  }
  const { supply, max, miners, mines, reward } = stats;
  const pct = max ? (supply / max) * 100 : 0;
  const pd = pct < 1 ? 3 : 1;
  eachStat("supply", (el) => showNum(el, supply, 0, "", animate));
  eachStat("max", (el) => showNum(el, max, 0, "", false));
  eachStat("remaining", (el) => showNum(el, max - supply, 0, "", animate));
  eachStat("miners", (el) => showNum(el, miners, 0, "", animate));
  eachStat("mines", (el) => showNum(el, mines, 0, "", animate));
  eachStat("pct", (el) => showNum(el, pct, pd, "%", animate));
  document.querySelectorAll("[data-progress]").forEach((el) => (el.style.width = Math.max(pct, 0.5) + "%"));

  const r = fmt(reward);
  if (window.I18N) I18N.vars.reward = r;
  document.querySelectorAll("[data-reward]").forEach((el) => (el.textContent = r));
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
    stats = {
      supply: units(supply),
      max: units(max),
      miners: Number(miners),
      mines: Number(mines),
      reward: units(reward),
    };
    cooldown = Number(cd) || cooldown;
    renderStats(true);

    if (stats.supply >= stats.max) {
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
  balance = units(bal);
  showNum($("balance"), balance, 2);
  lastMined = Number(last);
  setText("lastMined", lastMined ? timeAgo(lastMined) : T("never"));
  if (nextMine !== Infinity) nextMine = Number(next);
  updateMineButton();
}

/* ---------- Recent mines (mine.html) ---------- */
function renderFeed(animateNew = false) {
  const el = $("feed");
  if (!el) return;
  if (feedState.empty) {
    el.innerHTML = `<li class="feed-empty">${T(feedState.empty)}</li>`;
    return;
  }
  const first = feedSeen === null;
  el.innerHTML = feedState.items.map((it, i) => {
    const you = account && it.who.toLowerCase() === account.toLowerCase();
    const isNew = animateNew && (first || !feedSeen.has(it.hash));
    const cls = [you && "is-you", isNew && "is-new"].filter(Boolean).join(" ");
    return `<li${cls ? ` class="${cls}"` : ""} style="--i:${i}">
      <a href="${link("tx/" + it.hash)}" target="_blank" rel="noopener">
        <span class="feed-dot" aria-hidden="true"></span>
        <span class="feed-who">${you ? T("feed.you") : short(it.who)}</span>
        <span class="feed-amt">+${fmt(it.amount)} ${CONFIG.SYMBOL}</span>
        <time class="feed-time">${it.time ? timeAgo(it.time) : ""}</time>
      </a></li>`;
  }).join("");
  if (animateNew) feedSeen = new Set(feedState.items.map((it) => it.hash));
}

async function refreshFeed() {
  if (!$("feed") || !readContract) return;
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
    if (!recent.length) {
      feedState = { empty: "feed.none" };
      return renderFeed();
    }
    const blocks = await Promise.all(recent.map((e) => provider.getBlock(e.blockNumber)));
    feedState = {
      items: recent.map((e, i) => ({
        who: e.args.miner,
        amount: units(e.args.amount),
        hash: e.transactionHash,
        time: blocks[i]?.timestamp || 0,
      })),
    };
    renderFeed(true);
  } catch (err) {
    console.error("Error reading recent mines", err);
    feedState = { empty: "feed.error" };
    renderFeed();
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
    setText("mineLabel", T("btn.connect"));
    setText("nextMineText", "—");
    setRing(0);
    return;
  }
  if (nextMine === Infinity) {
    btn.disabled = true;
    setText("mineLabel", T("btn.exhausted"));
    setText("nextMineText", T("next.never"));
    setRing(0);
    return;
  }
  const left = nextMine - now();
  if (left > 0) {
    btn.disabled = true;
    setText("mineLabel", T("btn.next", { time: countdown(left) }));
    setText("nextMineText", countdown(left));
    setRing(1 - left / cooldown);
  } else {
    btn.disabled = false;
    setText("mineLabel", T("btn.mine"));
    setText("nextMineText", T("next.ready"));
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
  // 3D coin spin (defined in fx.js)
  if (typeof window.novaCelebrate === "function") window.novaCelebrate();

  const box = $("particles");
  if (!box) return;
  const reward = document.querySelector("[data-reward]")?.textContent || "100";
  for (let i = 0; i < 9; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.textContent = i === 0 ? `+${reward} ${CONFIG.SYMBOL}` : "+";
    p.style.setProperty("--dx", (Math.random() * 220 - 110) + "px");
    p.style.animationDelay = i * 0.07 + "s";
    p.style.fontSize = i === 0 ? "1.5rem" : (0.9 + Math.random() * 0.7) + "rem";
    box.appendChild(p);
    setTimeout(() => p.remove(), 2400);
  }
}

function setStatus(key, vars = null, type = "") {
  statusState = { key, vars, type };
  renderStatus();
}

function renderStatus() {
  const el = $("mineStatus");
  if (!el || !statusState) return;
  el.innerHTML = T(statusState.key, statusState.vars || undefined);
  el.className = "mine-status " + statusState.type;
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
// Returns [translation key, values] so the message can be re-translated later
function niceError(err) {
  const msg = (err?.shortMessage || err?.reason || err?.message || "").toLowerCase();
  if (err?.code === 4001 || err?.code === "ACTION_REJECTED" || msg.includes("rejected")) return ["err.cancel", null];
  if (msg.includes("insufficient funds")) return ["err.funds", null];
  if (msg.includes("wait 24h")) return ["err.wait", null];
  if (msg.includes("max supply")) return ["err.max", null];
  const raw = err?.shortMessage || err?.message;
  return ["err.generic", { msg: () => (raw ? esc(raw) : T("err.unknown")) }];
}
