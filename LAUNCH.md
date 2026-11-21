# Launch plan

A smart contract can't be edited after it's deployed, so a good start depends on decisions made **before** deploying.

## 1. The problem with version 1, and what changed

Version 1 gave **100 NOVA per mine, once every 24 h per wallet, up to 1,000,000**. The limit was per wallet, and wallets are free to create. A short script that creates wallets and calls `mine()` from each one could take the whole supply in an afternoon for about $20–300, and the project would be over on launch day.

Version 2 (`contracts/Nova.sol`) changes **how coins are created**, not just the limits:

| | Version 1 | Version 2 |
|---|---|---|
| Max supply | 1,000,000 | **21,000,000** |
| What a mine gives | 100 NOVA, instantly | **An equal share** of the day's reward |
| Coins created per day | unlimited (10,000 mines = everything) | **at most the daily reward** (50,000 at the start) |
| Over time | the same until it runs out | **halves every 210 days** |
| Fastest anyone can empty it | one afternoon | **never**: it takes ~37 years of daily rewards and gets slower each era |
| Mining at 23:00 vs 00:01 | the same | the same (no race) |

### How it works

1. Every UTC day (00:00 to 24:00) the contract releases a fixed **daily reward**. Day 0 is the launch day.
2. Every wallet can call `mine()` **once per day**. That registers it as one of the day's miners.
3. When the day closes, the daily reward is **split equally** among that day's miners.
4. The share is paid **the next time the wallet mines** (automatically), or any time with `claim()`.
5. The daily reward **halves every 210 days**, like Bitcoin's block reward (50 BTC, halving every 210,000 blocks). That is where 21 million comes from: 50,000 × 210 × (1 + ½ + ¼ + …) = 21,000,000.
6. If nobody mines on a day, that day's coins are **never created**.

### Why 21 million and 50,000 a day

- It mirrors Bitcoin's schedule on purpose, which makes the "is it like Bitcoin?" lesson concrete: 50 → 50,000, 210,000 blocks → 210 days, 21 million → 21 million.
- 50,000 a day is big enough that every miner gets a satisfying number even on a busy day (1,000 miners → 50 NOVA each) and on a quiet day it's a jackpot (5 miners → 10,000 each).
- 210 days is a school-year rhythm: the first halving happens about 7 months after launch, so people see it happen.

### Emission schedule (if every day has miners)

| Era | Days | Daily reward | Created in the era | Total so far |
|---|---|---|---|---|
| 1 | 0 – 209 (~7 months) | 50,000 | 10,500,000 | 10,500,000 (50%) |
| 2 | 210 – 419 | 25,000 | 5,250,000 | 15,750,000 (75%) |
| 3 | 420 – 629 | 12,500 | 2,625,000 | 18,375,000 (87.5%) |
| 4 | 630 – 839 | 6,250 | 1,312,500 | 19,687,500 (93.75%) |
| 5 | 840 – 1,049 (~2.9 years) | 3,125 | 656,250 | 20,343,750 (96.9%) |
| … | … | halves | … | approaches 21,000,000 |
| 64 | ends on day 13,440 (~37 years) | 0 | — | never passes 21,000,000 |

### What it still can't stop, and why that's acceptable

On a public blockchain without identity checks, **no design can stop one person from using many wallets**. In version 2:

- someone with N wallets gets N shares of a day. 1,000 wallets cost roughly $2–10 in gas **every day**, and they still only get a slice of that one day's reward;
- they can never take the supply in one go, never take more than one day's reward per day, and never stop real people from getting their share;
- real people don't have to race: they can mine whenever they want during the day.

If bots become a real problem, the next step is an identity check (Coinbase Verifications on Base, Gitcoin Passport, or a list of allowed wallets for a classroom). That needs a new contract, so decide before deploying.

### The contract is tested

`test/Nova.test.js` checks every rule above: no pre-mine, once per wallet per day, equal split, automatic payout, claim, days with no miners, halving, the 21M cap, the end of mining and the logo permission. Run it with:

```bash
npm install
npm test
```

## 2. Launch sequence

1. **Testnet rehearsal (Base Sepolia).** Deploy, set `NETWORK: "baseSepolia"`, and have 3 to 5 friends mine from their own phones and laptops. Come back the next day to see the shares paid and the "Claim" button work.
2. **Publish the site before the contract** (see README step 1), so the constructor can receive the final `logoURI` and you never need to call `setLogoURI`.
3. **Deploy from a fresh wallet** used only for Nova. The `creator` address is public forever, so keep your personal wallet's history out of it.
4. **Verify the contract on Basescan right away.** Unverified token contracts look like scams, and "anyone can read the code" is one of the site's promises.
5. **Deploy just after 00:00 UTC.** Day 0 starts at the previous midnight UTC, so deploying late in the day makes the first day very short.
6. **Make the genesis mine yourself, live**, and share the Basescan link to that transaction: public proof that you start at zero like everyone else.
7. **Announce with a fixed start day** (for example a class session or a group chat), so day 0 is shared by as many people as possible.

## 3. On launch day

- **Gas is the main friction.** Most people won't have ETH on Base. Plan one of these:
  - do the demo on Base Sepolia, where test ETH is free, or
  - send each participant a few cents of Base ETH yourself (a couple of dollars covers a whole class).
- **Explain "you get it tomorrow".** The site says it, but say it out loud too: today you join, tomorrow you collect.
- **Show the miner page live.** "Today", the countdown to the end of the day and the activity list are the best part of the demo.

## 4. What not to do

- **Don't add a liquidity pool** (Uniswap/Aerodrome) or sell NOVA. That makes it a tradable crypto-asset and brings MiCA obligations and scam perception. The site says "no monetary value", so keep it that way.
- **Don't promise future value**, airdrops or "early miner rewards".
- **Don't reuse the deployer wallet** for anything else.

## 5. Nice-to-haves after launch

- An Open Graph share image (1200×630) so links look good in chats.
- A Base Sepolia / Base toggle so visitors can practise for free first.
- A small chart of the emission schedule on the site.
