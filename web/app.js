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

  // Public test version on Base Sepolia (free test ETH). Opened with ?testnet,
  // from a small link in the footer. Leave empty to hide that link.
  TESTNET_ADDRESS: "0xfCDD804A78c8C329ae690fC9Dd1Bb897278B815B",

  // Logo sent to MetaMask when the user clicks "Add to MetaMask"
  LOGO: "logo.png",

  // Where people can trade NOVA. Shows "Trade NOVA" buttons once filled in.
  // Fill it in only AFTER a NOVA pool exists, e.g. on Uniswap:
  //   https://app.uniswap.org/swap?chain=base&outputCurrency=<CONTRACT_ADDRESS>
  TRADE_URL: "",
};

// The contract's fixed rules (contracts/Nova.sol). Shown before the contract is live.
const SCHEDULE = { MAX_SUPPLY: 21_000_000, INITIAL_DAILY: 50_000, HALVING_DAYS: 210 };

const NETWORKS = {
  base: {
    chainId: 8453,
    name: "Base",
    rpc: "https://mainnet.base.org",
    // Base's own endpoint only searches ~100 blocks of events at a time,
    // so the activity feed reads events from this free endpoint instead
    logsRpc: "https://base-rpc.publicnode.com",
    explorer: "https://basescan.org",
  },
  baseSepolia: {
    chainId: 84532,
    name: "Base Sepolia (testnet)",
    rpc: "https://sepolia.base.org",
    logsRpc: "https://base-sepolia-rpc.publicnode.com",
    explorer: "https://base-sepolia.blockscout.com", // shows the verified source code
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
  "function claim()",
  "function balanceOf(address) view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function info() view returns (uint256 day, uint256 reward, uint256 minersToday, uint256 powerToday, uint256 closesAt, uint256 halvingDay, uint256 supply, uint256 allMiners, uint256 allMines)",
  "function minerInfo(address) view returns (bool minedToday, uint256 lastDay, bool hasMined, uint256 claimableNow, uint256 shareToday, uint256 power, uint256 mined)",
  "event Mined(address indexed miner, uint256 indexed day, uint256 power)",
  "event Claimed(address indexed miner, uint256 indexed day, uint256 amount)",
];

/* ---------- State ---------- */
const isAddress = (a) => /^0x[a-fA-F0-9]{40}$/.test(a || "");
const hasTestnet = isAddress(CONFIG.TESTNET_ADDRESS);
const testnet = hasTestnet && new URLSearchParams(location.search).has("testnet");
const net = testnet ? NETWORKS.baseSepolia : NETWORKS[CONFIG.NETWORK];
const CONTRACT = testnet ? CONFIG.TESTNET_ADDRESS : CONFIG.CONTRACT_ADDRESS;
const configured = isAddress(CONTRACT);
let readContract = null; // reads data without a wallet
let signer = null;
let account = null;
let chain = null;        // today's numbers from the contract
let me = null;           // this wallet's numbers from the contract
let busy = false;
let busyLabel = "";      // translation key shown on the button while busy
let rolling = false;     // a new day just started and we're re-reading
let feedState = { empty: "feed.loading" }; // or { items: [...] }
let feedSeen = null;     // events already shown, to animate only new ones
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

// When the current day closes (00:00 UTC). Uses the contract once it's live.
const closesAt = () => chain?.closesAt || (Math.floor(now() / 86400) + 1) * 86400;
// Mining power comes in hundredths from the contract: 382 → "3.8x"
const fmtPower = (p) => (p / 100).toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "x";
const localTime = (ts) => new Date(ts * 1000).toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });

function timeAgo(sec) {
  const s = Math.max(0, now() - sec);
  if (s < 60) return T("ago.now");
  if (s < 3600) return T("ago.min", { n: Math.floor(s / 60) });
  if (s < 86400) return T("ago.h", { n: Math.floor(s / 3600) });
  return T("ago.d", { n: Math.floor(s / 86400) });
}

function dayName(d) {
  if (chain && d === chain.day) return T("day.today");
  if (chain && d === chain.day - 1) return T("day.yesterday");
  return T("day.n", { n: d });
}

function countdown(sec) {
  sec = Math.max(0, sec);
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return [h, m, s].map((x) => String(x).padStart(2, "0")).join(":");
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
}

// The small footer link to the public test version (and back)
function renderTestnetLink() {
  document.querySelectorAll("[data-testnet-link]").forEach((a) => {
    a.classList.toggle("hidden", !hasTestnet);
    a.textContent = T(testnet ? "footer.mainnet" : "footer.testnet");
  });
}

function setupTestnet() {
  if (testnet) {
    document.documentElement.classList.add("is-testnet");
    // Stay in test mode when moving between the home page and the miner
    document.querySelectorAll('a[href$=".html"]:not([data-testnet-link])').forEach((a) => {
      a.href = a.getAttribute("href") + "?testnet";
    });
  }
  document.querySelectorAll("[data-testnet-link]").forEach((a) => {
    a.href = testnet ? location.pathname.split("/").pop() || "index.html" : "?testnet";
  });
  renderTestnetLink();
}

// "Trade NOVA" buttons: only on the real network, and only once TRADE_URL is set
function setupTrade() {
  const show = !testnet && /^https:\/\//.test(CONFIG.TRADE_URL);
  document.querySelectorAll("[data-trade-link]").forEach((a) => {
    a.classList.toggle("hidden", !show);
    if (show) a.href = CONFIG.TRADE_URL;
  });
}

function init() {
  if (window.I18N) Object.assign(I18N.vars, { name: CONFIG.NAME, symbol: CONFIG.SYMBOL, network: net.name });
  fillNames();
  setupTestnet();
  setupTrade();

  const contractUrl = configured ? link(`address/${CONTRACT}`) : "#";
  document.querySelectorAll("[data-contract-link]").forEach((a) => (a.href = contractUrl));

  on("connectBtn", "click", connect);
  on("mineBtn", "click", () => send("mine"));
  on("claimBtn", "click", () => send("claim"));
  on("addTokenBtn", "click", addToWallet);
  document.addEventListener("nova:lang", onLanguage);

  renderConnect();
  renderStats(false);
  renderFeed();
  renderWallet();
  updateMineButton();
  setStatus(testnet ? "st.needTest" : "st.need");
  setInterval(tick, 1000); // the day countdown runs even before the contract is live

  if (typeof ethers === "undefined") return setStatus("st.ethers", null, "error");

  if (!configured) {
    // While only the test version exists, visitors see a calm "not open yet"
    // instead of the developer banner
    if (hasTestnet) setStatus("st.soon");
    else {
      $("configBanner")?.classList.remove("hidden");
      setStatus("st.notConfigured", null, "error");
    }
    feedState = { empty: "feed.notLive" };
    renderFeed();
    return;
  }

  const rpc = new ethers.JsonRpcProvider(net.rpc, net.chainId, { staticNetwork: true });
  readContract = new ethers.Contract(CONTRACT, ABI, rpc);

  refreshStats();
  refreshFeed();
  setInterval(() => { refreshStats(); refreshUser(); }, 15000);
  setInterval(refreshFeed, 30000);

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
  renderTestnetLink();
  renderConnect();
  renderStats(false);
  renderFeed();
  renderWallet(false);
  renderStatus();
  if (busy) setText("mineLabel", T(busyLabel));
  else updateMineButton();
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

    await refreshUser();
    renderFeed();
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

/* ---------- Mine and claim ---------- */
// The Claimed event in a receipt tells us what was just paid
function paidIn(receipt) {
  for (const log of receipt.logs) {
    try {
      const ev = readContract.interface.parseLog(log);
      if (ev?.name === "Claimed") return { amount: units(ev.args.amount), day: Number(ev.args.day) };
    } catch (_) { /* a log from another contract */ }
  }
  return null;
}

async function send(method) {
  if (!signer || busy) return;
  busy = true;
  const btn = $("mineBtn");
  btn.disabled = true;
  btn.classList.add("working");
  $("claimBtn")?.setAttribute("disabled", "");
  busyLabel = "btn.confirm";
  setText("mineLabel", T(busyLabel));
  setStatus("st.confirm");

  try {
    const contract = new ethers.Contract(CONTRACT, ABI, signer);
    const tx = await contract[method]();
    busyLabel = method === "mine" ? "btn.mining" : "btn.claiming";
    setText("mineLabel", T(busyLabel));
    const href = link("tx/" + tx.hash);
    const view = () => (net.explorer ? ` <a href="${href}" target="_blank" rel="noopener">${T("st.view")}</a>` : "");
    setStatus("st.sent", { view });
    const receipt = await tx.wait();

    const paid = paidIn(receipt);
    celebrate(paid?.amount ? `+${fmt(paid.amount)} ${CONFIG.SYMBOL}` : "⛏");
    if (method === "mine") {
      toast(paid?.amount ? T("toast.minedPaid", { amount: fmt(paid.amount), day: paid.day }) : T("toast.mined"));
    } else {
      toast(T("toast.claimed", { amount: fmt(paid?.amount || 0) }));
    }
    await refreshStats();
    busy = false;
    await refreshUser();
    refreshFeed();
  } catch (err) {
    console.error(err);
    setStatus(...niceError(err), "error");
  } finally {
    busy = false;
    btn.classList.remove("working");
    $("claimBtn")?.removeAttribute("disabled");
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
          address: CONTRACT,
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

/* ---------- Today's numbers ---------- */
function eachStat(name, fn) {
  document.querySelectorAll(`[data-stat="${name}"]`).forEach(fn);
}

// Your slice of today, given your mining power: what you have if you mined,
// or what you'd get by joining now. It shrinks as more people join.
function shareEstimate() {
  if (!chain || !me) return 0;
  const total = chain.powerToday + (me.minedToday ? 0 : me.power);
  return total ? (chain.reward * me.power) / total : 0;
}

// What an average miner gets today
const averageShare = () => (chain ? chain.reward / Math.max(1, chain.minersToday) : 0);

function renderStats(animate = true) {
  const max = chain?.max ?? SCHEDULE.MAX_SUPPLY;
  const daily = chain?.reward ?? SCHEDULE.INITIAL_DAILY; // before launch: day 0's reward
  if (window.I18N) {
    I18N.vars.daily = fmt(daily);
    I18N.vars.resettime = localTime(closesAt());
  }
  eachStat("max", (el) => showNum(el, max, 0, "", false));
  eachStat("daily", (el) => showNum(el, daily, 0, "", animate && !!chain));
  document.querySelectorAll("[data-reset-time]").forEach((el) => (el.textContent = localTime(closesAt())));
  if (!chain) return;

  const pct = max ? (chain.supply / max) * 100 : 0;
  const pd = pct < 1 ? 3 : 1;
  eachStat("supply", (el) => showNum(el, chain.supply, 0, "", animate));
  eachStat("pct", (el) => showNum(el, pct, pd, "%", animate));
  eachStat("miners", (el) => showNum(el, chain.allMiners, 0, "", animate));
  eachStat("mines", (el) => showNum(el, chain.allMines, 0, "", animate));
  eachStat("today", (el) => showNum(el, chain.minersToday, 0, "", animate));
  eachStat("day", (el) => showNum(el, chain.day, 0, "", false));
  eachStat("share", (el) => showNum(el, averageShare(), 0, "", animate));
  eachStat("halving", (el) => showNum(el, chain.halvingDay - chain.day, 0, "", false));
  eachStat("nextdaily", (el) => showNum(el, chain.reward / 2, 2, "", false));
  document.querySelectorAll("[data-progress]").forEach((el) => (el.style.width = Math.max(pct, 0.5) + "%"));
}

async function refreshStats() {
  if (!readContract) return;
  try {
    const [i, max] = await Promise.all([readContract.info(), chain ? chain.maxRaw : readContract.MAX_SUPPLY()]);
    chain = {
      day: Number(i.day),
      reward: units(i.reward),
      minersToday: Number(i.minersToday),
      powerToday: Number(i.powerToday),
      closesAt: Number(i.closesAt),
      halvingDay: Number(i.halvingDay),
      supply: units(i.supply),
      allMiners: Number(i.allMiners),
      allMines: Number(i.allMines),
      max: units(max),
      maxRaw: max,
    };
    renderStats(true);
    if (me) {
      // The wallet may have loaded first: its share estimate needs today's numbers
      renderWallet(false);
      userStatus();
    }
    if (!busy) updateMineButton();
  } catch (err) {
    console.error("Error reading stats", err);
  }
}

/* ---------- This wallet ---------- */
async function refreshUser() {
  if (!account || !readContract || busy) return;
  try {
    const [bal, m] = await Promise.all([readContract.balanceOf(account), readContract.minerInfo(account)]);
    me = {
      balance: units(bal),
      minedToday: m.minedToday,
      lastDay: Number(m.lastDay),
      hasMined: m.hasMined,
      claimable: units(m.claimableNow),
      shareToday: units(m.shareToday),
      power: Number(m.power),
      mined: units(m.mined),
    };
    renderWallet(true);
    renderStats(false);
    updateMineButton();
    userStatus();
  } catch (err) {
    console.error("Error reading wallet", err);
  }
}

// The message under the button, depending on where this wallet stands today
function userStatus() {
  if (!me || busy) return;
  if (chain && chain.reward === 0) return setStatus("st.ended");
  const power = () => `<strong>${fmtPower(me.power)}</strong>`;
  if (me.minedToday) {
    return setStatus("st.joined", { power, share: () => fmt(shareEstimate()), time: () => localTime(closesAt()) }, "ok");
  }
  if (me.claimable > 0) return setStatus("st.claimHint", { amount: () => fmt(me.claimable), day: me.lastDay });
  setStatus("st.ready", { power });
}

function renderWallet(animate = true) {
  if (me) showNum($("balance"), me.balance, 2, "", animate);
  setText("lastMined", !account ? "—" : me?.hasMined ? dayName(me.lastDay) : T("never"));
  setText("claimableText", me ? `${fmt(me.claimable)} ${CONFIG.SYMBOL}` : "—");
  setText("shareText", me?.minedToday ? `~${fmt(shareEstimate())} ${CONFIG.SYMBOL}` : "—");
  document.querySelectorAll("[data-power]").forEach((el) => {
    el.textContent = me ? fmtPower(me.power) : "—";
    // 0 at 1x, 1 at 5x: drives the little power bar
    el.closest("[data-power-box]")?.style.setProperty("--power", me ? String((me.power - 100) / 400) : "0");
  });

  const claim = $("claimBtn");
  if (claim) {
    const show = !!(me && me.claimable > 0);
    claim.classList.toggle("hidden", !show);
    if (show) claim.textContent = T("btn.claim", { amount: fmt(me.claimable) });
  }
}

/* ---------- Recent activity (mine.html) ---------- */
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
    const isNew = animateNew && (first || !feedSeen.has(it.key));
    const cls = [you && "is-you", isNew && "is-new", it.kind === "Mined" && "is-mine"].filter(Boolean).join(" ");
    const what = it.kind === "Claimed" ? `+${fmt(it.amount)} ${CONFIG.SYMBOL}` : T("feed.mined", { power: fmtPower(it.power) });
    return `<li${cls ? ` class="${cls}"` : ""} style="--i:${i}">
      <a href="${link("tx/" + it.hash)}" target="_blank" rel="noopener">
        <span class="feed-dot" aria-hidden="true"></span>
        <span class="feed-who">${you ? T("feed.you") : short(it.who)}</span>
        <span class="feed-amt">${what}</span>
        <time class="feed-time">${it.time ? timeAgo(it.time) : ""}</time>
      </a></li>`;
  }).join("");
  if (animateNew) feedSeen = new Set(feedState.items.map((it) => it.key));
}

// Contract connected to the events endpoint (see logsRpc in NETWORKS)
let _logs = null;
function logsContract() {
  if (!_logs) {
    _logs = net.logsRpc
      ? new ethers.Contract(CONTRACT, ABI, new ethers.JsonRpcProvider(net.logsRpc, net.chainId, { staticNetwork: true }))
      : readContract;
  }
  return _logs;
}

async function refreshFeed() {
  if (!$("feed") || !readContract) return;
  try {
    const provider = readContract.runner;
    const latest = await provider.getBlockNumber();
    let events = null;
    // Public RPCs limit how many blocks one query can cover: try the events
    // endpoint with a wide range first (~5 h of Base blocks), then smaller ones
    const tries = [[logsContract(), 9000], [logsContract(), 2000], [readContract, 100]];
    for (const [c, range] of tries) {
      try {
        const from = Math.max(0, latest - range);
        const [mined, claimed] = await Promise.all([
          c.queryFilter(c.filters.Mined(), from, latest),
          c.queryFilter(c.filters.Claimed(), from, latest),
        ]);
        events = [...mined, ...claimed];
        break;
      } catch (_) { /* try the next option */ }
    }
    if (!events) throw new Error("no endpoint returned events");
    const recent = events
      .filter((e) => e.eventName === "Mined" || e.args.amount > 0n)
      .sort((a, b) => b.blockNumber - a.blockNumber || b.index - a.index)
      .slice(0, 6);
    if (!recent.length) {
      feedState = { empty: "feed.none" };
      return renderFeed();
    }
    const blocks = await Promise.all([...new Set(recent.map((e) => e.blockNumber))].map((n) => provider.getBlock(n)));
    const time = Object.fromEntries(blocks.filter(Boolean).map((b) => [b.number, b.timestamp]));
    feedState = {
      items: recent.map((e) => ({
        kind: e.eventName,
        key: `${e.transactionHash}:${e.index}`,
        who: e.args.miner,
        day: Number(e.args.day),
        amount: e.eventName === "Claimed" ? units(e.args.amount) : 0,
        power: e.eventName === "Mined" ? Number(e.args.power) : 0,
        hash: e.transactionHash,
        time: time[e.blockNumber] || 0,
      })),
    };
    renderFeed(true);
  } catch (err) {
    console.error("Error reading recent activity", err);
    feedState = { empty: "feed.error" };
    renderFeed();
  }
}

/* ---------- Clock, button and ring ---------- */
function tick() {
  const left = closesAt() - now();
  document.querySelectorAll("[data-clock]").forEach((el) => (el.textContent = countdown(left)));
  // A new day started: read everything again
  if (left <= 0 && readContract && !rolling) {
    rolling = true;
    Promise.all([refreshStats(), refreshUser(), refreshFeed()]).finally(() => (rolling = false));
  }
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
  if (chain && chain.reward === 0) {
    btn.disabled = true;
    setText("mineLabel", T("btn.ended"));
    setText("nextMineText", "—");
    setRing(0);
    return;
  }
  if (me?.minedToday) {
    // Already mined today: the ring fills up as the day goes by
    const left = closesAt() - now();
    btn.disabled = true;
    setText("mineLabel", T("btn.next", { time: countdown(left) }));
    setText("nextMineText", countdown(left));
    setRing(1 - left / 86400);
  } else {
    btn.disabled = !me;
    setText("mineLabel", T("btn.mine"));
    setText("nextMineText", T("next.ready"));
    setRing(1);
  }
}

/* ---------- Effects ---------- */
function celebrate(text) {
  // 3D coin spin (defined in fx.js)
  if (typeof window.novaCelebrate === "function") window.novaCelebrate();

  const box = $("particles");
  if (!box) return;
  for (let i = 0; i < 9; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    p.textContent = i === 0 ? text : "+";
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
  if (msg.includes("already mined today")) return ["err.wait", null];
  if (msg.includes("mining has ended")) return ["err.ended", null];
  if (msg.includes("nothing to claim")) return ["err.nothing", null];
  const raw = err?.shortMessage || err?.message;
  return ["err.generic", { msg: () => (raw ? esc(raw) : T("err.unknown")) }];
}
