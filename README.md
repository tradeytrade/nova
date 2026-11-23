# Nova (NOVA)

**The coin you mine in one click.** A community-mined ERC-20 token on Base: mine once a day from the website and share that day's reward with everyone who mined.

**Website:** https://tradeytrade.github.io/nova/ · **Miner:** https://tradeytrade.github.io/nova/mine.html

| | |
|---|---|
| Contract (Base) | [`0xfCDD804A78c8C329ae690fC9Dd1Bb897278B815B`](https://base.blockscout.com/address/0xfCDD804A78c8C329ae690fC9Dd1Bb897278B815B) |
| Source code | verified on [Sourcify](https://repo.sourcify.dev/8453/0xfCDD804A78c8C329ae690fC9Dd1Bb897278B815B) (exact match) |
| Launched | 23 Nov 2026, with no pre-mine |
| Test version | same address on Base Sepolia, at [`?testnet`](https://tradeytrade.github.io/nova/?testnet) |

## How it works

| Rule | Value |
|---|---|
| Daily reward | 50,000 NOVA, split among that day's miners |
| Mining | once per wallet per UTC day; no race, any time of day counts the same |
| Your share | paid when the day closes (00:00 UTC), on your next mine or with `claim()` |
| Halving | the daily reward halves every 210 days |
| Max supply | 21,000,000 NOVA, never passed |
| Creator pre-mine | 0 |

At most one daily reward can ever be created per day, so nobody can take the supply at once.

**Mining power.** Each share is weighted by mining power, from 1x (a wallet with no NOVA) to 5x. It grows with the square root of the NOVA a wallet mined itself and still holds, and reaches 5x at two days' worth of reward (100,000 NOVA in the first era). Bought or received NOVA doesn't count, so one balance can't power many wallets.

| NOVA mined and held | 0 | 1,000 | 10,000 | 25,000 | 50,000 | 100,000+ |
|---|---|---|---|---|---|---|
| Mining power | 1.0x | 1.4x | 2.3x | 3.0x | 3.8x | 5x |

## Project

```
contracts/Nova.sol    the token and its mining rules
test/Nova.test.js     tests for every rule
scripts/deploy.js     deploy script
web/                  the website (English, Spanish, French)
```

```bash
npm install
npm test                                                  # run the tests
npx hardhat run scripts/deploy.js --network baseSepolia   # deploy (DEPLOYER_KEY in .env)
cd web && python -m http.server 8000                      # preview the site
```

Site settings (contract address, network, trade link) are at the top of `web/app.js`; texts are in `web/i18n.js`.

## Disclaimer

NOVA is a standard ERC-20 token. Its price, if it trades, is set only by the market and can go to zero. Nothing here is financial advice.

## License

[MIT](LICENSE)
