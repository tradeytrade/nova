# Launch plan

A smart contract can't be edited after it's deployed, so a good start depends on decisions made **before** deploying.

## 1. The biggest risk: one person mines everything on day one

"Once every 24 hours" is enforced **per wallet**, but wallets are free to create. A short script that creates wallets and calls `mine()` from each one could take the whole supply:

| | |
|---|---|
| Mines needed to empty the supply | 1,000,000 / 100 = **10,000** |
| Gas per mine on Base | ~$0.002 – $0.03 |
| **Cost to take the entire supply** | **~$20 – $300**, in one afternoon |

A helper contract can do it even more cheaply by spawning many throwaway addresses in a single transaction. If that happens, the counter hits 100% on launch day and the project is over before your classmates get to try it.

### Options (pick before deploying)

| Option | What it does | Trade-off |
|---|---|---|
| **A. Global daily cap** *(recommended)* | At most N mines per day across everyone, e.g. 500/day = 50,000 NOVA/day, so mining lasts **at least 20 days** whatever bots do. | Bots can still grab each day's slots early, but they can't end the project. Simple to explain. |
| **B. Bitcoin-style halving** *(recommended, combine with A)* | The reward halves as supply fills up: 100 NOVA for the first 500k, then 50, 25, 12… | Early miners get more, like Bitcoin. Makes the "is it like Bitcoin?" FAQ answer more interesting. |
| C. Only wallets, not contracts (`msg.sender == tx.origin`) | Blocks the cheap helper-contract attack. | Also blocks smart-contract wallets (e.g. Coinbase Smart Wallet, common on Base). |
| D. Proof of humanity (Coinbase Verifications, Gitcoin Passport, signed captcha) | Real anti-bot protection. | Needs a backend or third-party integration. Too heavy for an educational project. |
| E. Leave it as is | Simplest. | Accepts the drain risk. Fine for a classroom where only invited people know the address. |

**Recommendation:** A + B. That is about 15 lines of Solidity, keeps the rules immutable and on-chain, and gives a better story ("supply is released like Bitcoin's block reward").

## 2. Launch sequence

1. **Testnet rehearsal (Base Sepolia).** Deploy, set `NETWORK: "baseSepolia"`, and have 3 to 5 friends mine from their own phones and laptops. Check the countdown, the "Add to MetaMask" button and the explorer links.
2. **Publish the site before the contract** (see README step 1), so the constructor can receive the final `logoURI` and you never need to call `setLogoURI`.
3. **Deploy from a fresh wallet** used only for Nova. The `creator` address is public forever, so keep your personal wallet's history out of it.
4. **Verify the contract on Basescan right away.** Unverified token contracts look like scams, and "anyone can read the code" is one of the site's promises.
5. **Make the genesis mine yourself, live.** The creator's first `mine()` transaction is public proof that you start at zero like everyone else. Share the Basescan link to that transaction.
6. **Announce with a fixed start time** (for example a class session or a group chat), not a quiet drop. Everyone starts together, which matters most if you skip option A.

## 3. On launch day

- **Gas is the main friction.** Most people won't have ETH on Base. Plan one of these:
  - do the demo on Base Sepolia, where test ETH is free, or
  - send each participant a few cents of Base ETH yourself (a couple of dollars covers a whole class).
- **Show the stats live.** The hero counter (mined / miners / left) is the best part of the demo.
- Have the **explorer link** for the contract and for your genesis transaction ready to show.

## 4. What not to do

- **Don't add a liquidity pool** (Uniswap/Aerodrome) or sell NOVA. That makes it a tradable crypto-asset and brings MiCA obligations and scam perception. The site says "no monetary value", so keep it that way.
- **Don't promise future value**, airdrops or "early miner rewards".
- **Don't reuse the deployer wallet** for anything else.

## 5. Nice-to-haves after launch

- A small "latest miners" list on the site, read from the contract's `Mined` events.
- A Base Sepolia / Base toggle so visitors can practise for free first.
- An Open Graph share image (1200×630) so links look good in chats.
