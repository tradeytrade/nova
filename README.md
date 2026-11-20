# Nova (NOVA): the coin you mine in one click

An educational project: an ERC-20 token on the **Base** network that anyone can mine for free from a website, **100 NOVA every 24 hours**, up to a maximum of **1,000,000 NOVA**.

```
nova/
├── contracts/
│   └── Nova.sol        ← smart contract (Solidity)
├── web/
│   ├── index.html      ← the page
│   ├── style.css       ← design (colours in :root)
│   ├── app.js          ← MetaMask + contract connection (CONFIG at the top)
│   ├── motion.js       ← animations: 3D coin, parallax and smooth scrolling
│   ├── logo-mark.svg   ← the logo (the N) as a vector
│   ├── coin.svg        ← the coin face (also used as the favicon)
│   ├── logo.png        ← 256×256 icon (MetaMask and logoURI)
│   ├── logo-32.png     ← 32×32 icon (Basescan token form)
│   └── favicon.png     ← fallback browser tab icon
├── .github/workflows/
│   └── pages.yml       ← deploys web/ to GitHub Pages (manual trigger only)
└── LAUNCH.md           ← launch plan
```

## The website

- **A 3D coin that travels down the page:** it follows you as you scroll, spins and switches sides in every section, and finally **lands inside the mining panel**. When you mine, it does a celebration spin.
- **Parallax:** rock strata in the hero that move at different speeds, and a giant word in the outro that slides.
- **Scroll animations:** the manifesto text lights up word by word.
- **Smooth scrolling** with Lenis, and an animated hero entrance.
- If the system has **"reduce motion"** turned on, or the libraries fail to load, the site stays static (a fixed coin in each section) and everything keeps working.

Libraries (loaded from a CDN, pinned to exact versions, nothing to install): ethers.js 6.13.4, GSAP 3.12.5 + ScrollTrigger, and Lenis 1.1.13.

To preview locally:
```bash
cd web
python -m http.server 8000
# open http://localhost:8000
```

---

## Contract rules

| Rule | Value |
|---|---|
| Maximum supply | 1,000,000 NOVA |
| Reward per mine | 100 NOVA |
| Time between mines | 24 h per wallet |
| Creator pre-mine | 0 |

Main functions:
- `mine()`: mines your reward (reverts if 24 h haven't passed or the supply is exhausted)
- `nextMineTime(wallet)`: when a wallet can mine again
- `totalMiners()` / `totalMines()`: stats
- `logoURI()`: link to the logo stored on-chain
- `setLogoURI(url)`: only the creator can change the logo

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
| Each mine | cents (paid by the miner) |
| Website on GitHub Pages | $0 |
| Domain (optional) | ~$10/year |

## Disclaimer
Educational project. NOVA has no monetary value, is not sold and has no liquidity. If it were sold to third parties it would fall under the EU crypto-asset regulation (MiCA).

## License
[MIT](LICENSE)
