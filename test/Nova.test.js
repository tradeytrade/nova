// Tests for contracts/Nova.sol. Run them with:  npm install  then  npm test
const hre = require("hardhat");
const { ethers } = require("ethers");
const assert = require("node:assert/strict");

const DAY = 86400;
const NOVA = (n) => ethers.parseUnits(String(n), 18);

let provider, nova, wallets, creator;

async function deploy() {
  await hre.network.provider.send("hardhat_reset", []);
  // No request cache and fast polling: the tests move time and expect fresh answers
  provider = new ethers.BrowserProvider(hre.network.provider, undefined, { cacheTimeout: -1, pollingInterval: 20 });
  wallets = await Promise.all([...Array(12)].map((_, i) => provider.getSigner(i)));
  creator = wallets[0];
  const art = await hre.artifacts.readArtifact("Nova");
  const factory = new ethers.ContractFactory(art.abi, art.bytecode, creator);
  nova = await factory.deploy("https://example.com/logo.png");
  await nova.waitForDeployment();
}

// Jump to `n` days later, one minute after 00:00 UTC
async function nextDay(n = 1) {
  const b = await provider.getBlock("latest");
  const target = (Math.floor(b.timestamp / DAY) + n) * DAY + 60;
  await provider.send("evm_setNextBlockTimestamp", [target]);
  await provider.send("evm_mine", []);
}

const mine = async (w) => (await nova.connect(w).mine()).wait();
const claim = async (w) => (await nova.connect(w).claim()).wait();
const balance = (w) => w.getAddress().then((a) => nova.balanceOf(a));

async function reverts(promise, message) {
  await assert.rejects(promise, (err) => {
    const text = `${err.shortMessage || ""} ${err.reason || ""} ${err.message || ""}`;
    assert.ok(text.includes(message), `expected "${message}", got: ${text}`);
    return true;
  });
}

describe("Nova", function () {
  this.timeout(60000);
  beforeEach(deploy);

  it("starts empty: no pre-mine, day 0, 50,000 NOVA a day", async () => {
    assert.equal(await nova.totalSupply(), 0n);
    assert.equal(await balance(creator), 0n);
    assert.equal(await nova.today(), 0n);
    assert.equal(await nova.dailyReward(0), NOVA(50000));
    assert.equal(await nova.MAX_SUPPLY(), NOVA(21000000));
  });

  it("lets each wallet mine only once per day", async () => {
    await mine(wallets[1]);
    await reverts(nova.connect(wallets[1]).mine(), "already mined today");
    await nextDay();
    await mine(wallets[1]); // a new day: allowed again
  });

  it("splits the day's reward equally, whatever time you mined", async () => {
    for (const w of wallets.slice(1, 5)) await mine(w);
    // While the day is open nothing can be claimed yet
    assert.equal(await nova.claimable(await wallets[1].getAddress()), 0n);
    await reverts(nova.connect(wallets[1]).claim(), "nothing to claim");

    await nextDay();
    for (const w of wallets.slice(1, 5)) {
      assert.equal(await nova.claimable(await w.getAddress()), NOVA(12500));
      await claim(w);
      assert.equal(await balance(w), NOVA(12500));
    }
    assert.equal(await nova.totalSupply(), NOVA(50000));
    await reverts(nova.connect(wallets[1]).claim(), "nothing to claim"); // only once
  });

  it("pays your last share automatically when you mine again", async () => {
    await mine(wallets[1]); // alone on day 0: gets the whole 50,000
    await nextDay();
    await mine(wallets[1]);
    assert.equal(await balance(wallets[1]), NOVA(50000));
  });

  it("still pays a day you mined if you come back much later", async () => {
    await mine(wallets[1]);
    await mine(wallets[2]);
    await nextDay(5);
    await mine(wallets[1]);
    assert.equal(await balance(wallets[1]), NOVA(25000));
    await claim(wallets[2]);
    assert.equal(await balance(wallets[2]), NOVA(25000));
  });

  it("never creates more than one daily reward per day, however many wallets", async () => {
    for (const w of wallets.slice(1)) await mine(w); // 11 wallets, e.g. one person with many
    await nextDay();
    for (const w of wallets.slice(1)) await claim(w);
    const supply = await nova.totalSupply();
    assert.ok(supply <= NOVA(50000), "more than one daily reward was created");
    assert.ok(NOVA(50000) - supply < 11n, "lost more than rounding dust");
  });

  it("creates nothing on a day nobody mined", async () => {
    await nextDay(3);
    await mine(wallets[1]);
    assert.equal(await nova.totalSupply(), 0n);
  });

  it("halves the reward every 210 days", async () => {
    assert.equal(await nova.dailyReward(209), NOVA(50000));
    assert.equal(await nova.dailyReward(210), NOVA(25000));
    assert.equal(await nova.dailyReward(420), NOVA(12500));
    assert.equal(await nova.dailyReward(64 * 210), 0n);

    await nextDay(210);
    assert.equal(await nova.today(), 210n);
    assert.equal(await nova.nextHalvingDay(), 420n);
    await mine(wallets[1]);
    await nextDay();
    await claim(wallets[1]);
    assert.equal(await balance(wallets[1]), NOVA(25000));
  });

  it("can never pass 21,000,000 NOVA, even if every day is mined", async () => {
    let total = 0n;
    for (let era = 0n; era < 64n; era++) total += (NOVA(50000) >> era) * 210n;
    assert.ok(total <= NOVA(21000000), `schedule adds up to ${ethers.formatUnits(total, 18)}`);
    assert.ok(total > NOVA(20999999), "schedule should get very close to 21M");
  });

  it("stops mining after the last halving but still pays earlier shares", async () => {
    await mine(wallets[1]);
    await nextDay(64 * 210);
    await reverts(nova.connect(wallets[2]).mine(), "mining has ended");
    await claim(wallets[1]);
    assert.equal(await balance(wallets[1]), NOVA(50000));
  });

  it("reports today and each wallet for the website", async () => {
    await mine(wallets[1]);
    await mine(wallets[2]);
    const info = await nova.info();
    assert.equal(info.day, 0n);
    assert.equal(info.reward, NOVA(50000));
    assert.equal(info.minersToday, 2n);
    assert.equal(info.allMiners, 2n);
    const me = await nova.minerInfo(await wallets[1].getAddress());
    assert.equal(me.minedToday, true);
    assert.equal(me.shareToday, NOVA(25000));
    assert.equal(me.claimableNow, 0n);

    await nextDay();
    const later = await nova.minerInfo(await wallets[1].getAddress());
    assert.equal(later.minedToday, false);
    assert.equal(later.claimableNow, NOVA(25000));
    const block = await provider.getBlock("latest");
    assert.equal(await nova.nextDayAt(), BigInt((Math.floor(block.timestamp / DAY) + 1) * DAY));
  });

  it("only lets the creator change the logo", async () => {
    await reverts(nova.connect(wallets[1]).setLogoURI("x"), "only the creator");
    await (await nova.connect(creator).setLogoURI("https://example.com/new.png")).wait();
    assert.equal(await nova.logoURI(), "https://example.com/new.png");
  });
});
