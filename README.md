# Nova (NOVA): the coin you mine in one click

An educational project: an ERC-20 token on the **Base** network that anyone can mine for free from a website, **once a day**. Every day the contract releases **50,000 NOVA** and splits them equally among everyone who mined that day. The daily amount **halves every 210 days**, like Bitcoin, so the supply approaches **21,000,000 NOVA** and never passes it.

```
nova/
├── contracts/
│   └── Nova.sol        ← smart contract (Solidity)
├── test/
│   └── Nova.test.js    ← tests for every contract rule (npm test)
├── web/
│   ├── index.html      ← landing page (with a mining section)
│   ├── mine.html       ← dedicated miner page
│   ├── style.css       ← design for both pages (colours in :root)
│   ├── i18n.js         ← all texts in English, Spanish and French
│   ├── app.js          ← MetaMask + contract connection (CONFIG at the top)
│   ├── motion.js       ← landing animations: flying coin, parallax, reveals
│   ├── fx.js           ← shared effects: interactive coin, magnetic buttons
│   ├── mine.js         ← miner page entrance animation
│   ├── logo-mark.svg   ← the logo (the N) as a vector
│   ├── coin.svg        ← the coin face (full detail)
│   ├── icon.svg        ← simplified coin for small sizes (favicon)
│   ├── logo.png        ← 256×256 icon (MetaMask and logoURI)
│   ├── logo-32.png     ← 32×32 icon (Basescan token form)
│   └── favicon.png     ← fallback browser tab icon
├── .github/workflows/
│   └── pages.yml       ← deploys web/ to GitHub Pages (manual trigger only)
├── package.json, hardhat.config.js ← only for compiling and testing locally
└── LAUNCH.md           ← launch plan and why the rules are what they are
```

## The website

- **A 3D coin that travels down the page:** it follows you as you scroll, spins and switches sides in every section, and finally **lands inside the mining panel**. When you mine, it does a celebration spin.
- **Parallax:** rock strata in the hero that move at different speeds, and a giant word in the outro that slides.
- **Scroll animations:** the manifesto text lights up word by word.
- **Smooth scrolling** with Lenis, and an animated hero entrance.
- **Three languages:** English, Spanish and French, from the menu in the header. The choice is remembered, the browser's language is used the first time, and `?lang=es` / `?lang=fr` in the URL works too. Every text, including the live messages, countdown, errors and number formats, is translated.
- **A coin you can play with:** it leans towards the mouse, you can drag it to spin it (it keeps the speed of your throw), and clicking or tapping it flips it.
- **More motion:** sections rise in as you scroll, divider lines draw themselves, numbers count up, buttons are slightly magnetic, a progress bar tracks the scroll, and dark cards light up under the mouse.
- **A dedicated miner page** (`mine.html`): a large 3D coin inside a ring that fills up as the day goes by, a "Today" panel (reward to share, miners so far, what each one gets, countdown to 00:00 UTC, next halving), your balance and share, a Claim button, supply stats and a feed of recent activity read from the contract's `Mined` and `Claimed` events.
- If the system has **"reduce motion"** turned on, or the libraries fail to load, the site stays static (a fixed coin in each section) and everything keeps working.

Libraries (loaded from a CDN, pinned to exact versions, nothing to install): ethers.js 6.13.4, GSAP 3.12.5 + ScrollTrigger, and Lenis 1.1.13.

To preview locally:
```bash
cd web
python -m http.server 8000
# open http://localhost:8000  (miner: http://localhost:8000/mine.html)
```

The coin artwork lives in `coin.svg` and `icon.svg`. If you edit them, re-export `logo.png` (256 px), `logo-32.png` (32 px, from `icon.svg`) and `favicon.png` (64 px, from `icon.svg`) with any SVG-to-PNG tool.

---

## Contract rules

| Rule | Value |
|---|---|
| Maximum supply | 21,000,000 NOVA (hard cap) |
| Released per day | 50,000 NOVA, split equally among that day's miners |
| Halving | the daily amount halves every 210 days |
| Mines per wallet | once per UTC day (00:00 to 24:00 UTC) |
| When you get your share | when the day closes: paid on your next mine, or with `claim()` |
| Creator pre-mine | 0 |

Nobody can take the supply in one day: at most one daily reward can be created per day, whatever happens. [LAUNCH.md](LAUNCH.md) explains the design, the full emission schedule and what it can and can't prevent.

Main functions:
- `mine()`: join today's mining (also pays your share of the last day you mined)
- `claim()`: collect your share of the last day you mined, without mining again
- `info()`: today's numbers in one call (day, reward, miners today, when the day closes, next halving, supply, totals)
- `minerInfo(wallet)`: a wallet's numbers in one call (mined today?, last day, what it can claim, its share today)
- `dailyReward(day)`, `shareOf(day)`, `claimable(wallet)`, `today()`: the schedule, step by step
- `logoURI()` / `setLogoURI(url)`: the logo link; only the creator can change it, nothing else

### Test the contract

```bash
npm install
npm test
```

The tests (`test/Nova.test.js`) run the contract on a local blockchain and move time forward to check every rule: the daily split, the halving, the 21M cap and more.

---

## Step-by-step deployment

> Read [LAUNCH.md](LAUNCH.md) before deploying to mainnet. A deployed contract can't be changed.

### 0. Before you start
1. Install **MetaMask** in your browser.
2. Get a few dollars of **ETH on the Base network**: buy ETH on an exchange (Coinbase, Binance, Kraken…) and when withdrawing to MetaMask choose the **Base** network. $5–10 is more than enough.

> 💡 **Want to try it for free first?** Use the **Base Sepolia** testnet. Search for "Base Sepolia faucet" to get test ETH and set `NETWORK: "baseSepolia"` in `app.js`. When everything works, repeat the steps on real Base.

### 1. Publish the website first (GitHub Pages)
Publishing the site first means you already know the logo URL when you deploy the contract.
1. Make this repository **public** (Settings → General → Danger Zone → Change visibility).
2. **Settings → Pages →** under *Source* choose **GitHub Actions**.
3. **Actions → Deploy website to GitHub Pages → Run workflow.**
4. After a minute or two the site is live at `https://YOUR_USERNAME.github.io/nova/`.

> Optional: buy a domain (~$10/year) and connect it in **Settings → Pages → Custom domain**.

### 2. Deploy the contract with Remix
1. Go to **https://remix.ethereum.org**.
2. Create a file `Nova.sol` and paste the contents of `contracts/Nova.sol`.
3. **Solidity Compiler** tab: choose version **0.8.20 or higher** and click **Compile Nova.sol**.
4. **Deploy & Run Transactions** tab:
   - Under *Environment* choose **Injected Provider - MetaMask** and check that MetaMask is on the **Base** network.
   - Under *Contract* choose **Nova**.
   - Next to **Deploy** there is a `_logoURI` field. Enter `https://YOUR_USERNAME.github.io/nova/logo.png` (or `""` if the site isn't online yet; you can set it later with `setLogoURI`).
   - Click **Deploy** and confirm in MetaMask.
5. At the bottom, under *Deployed Contracts*, copy the **contract address** (starts with `0x…`).

### 3. Configure the website
Open `web/app.js` and fill in:
```js
CONTRACT_ADDRESS: "0xYOUR_ADDRESS_HERE",
NETWORK: "base",
```
Commit and push, then run the Pages workflow again.

To change the **name**, edit `NAME` and `SYMBOL` in `app.js` and `ERC20("Nova", "NOVA")` in the contract (before deploying).
To change or add **texts and languages**, edit `i18n.js` (copy the `en` block to add a language).
To change the **colours**, edit the variables at the top of `style.css` (`--lime` is the logo green).

### 4. Verify the contract on Basescan (highly recommended)
This lets anyone, including your teacher, read the code on the explorer:
- **Easy way:** in Remix enable the **Contract Verification** plugin (plugin manager) and verify on Basescan, Blockscout or Sourcify.
- **Manual way:** in Remix right-click `Nova.sol` → **Flatten**, and paste the result into Basescan → *Verify and Publish* (same compiler version and optimizer settings you used).

### 5. (Optional) Logo on Basescan
Once the contract is verified, Basescan lets you request that it show the logo (*Update Token Info*, 32×32 image: use `logo-32.png`). They review it and it may take time or be rejected. **The website and MetaMask already show the logo without this.**

---

## How the logo shows up in MetaMask
ERC-20 has no image field, so the site uses `wallet_watchAsset` (EIP-747). When the user clicks **"Add NOVA to MetaMask"**, the site sends the token **with its logo** and the user sees it with a picture in their wallet, with no approval from anyone.

## Approximate cost
| Item | Cost |
|---|---|
| Deploying the contract on Base | cents |
| Each mine or claim | under a cent to a few cents (paid by the miner) |
| Website on GitHub Pages | $0 |
| Domain (optional) | ~$10/year |

## Disclaimer
Educational project. NOVA has no monetary value, is not sold and has no liquidity. If it were sold to third parties it would fall under the EU crypto-asset regulation (MiCA).

## License
[MIT](LICENSE)
