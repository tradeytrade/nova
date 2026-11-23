// Compiles, tests and (optionally) deploys the contract.
//   npm test                                              run the tests
//   npx hardhat run scripts/deploy.js --network baseSepolia   deploy to the testnet
// For deploying, put DEPLOYER_KEY=0x... in a .env file (it is git-ignored).
require("@nomicfoundation/hardhat-verify");
const fs = require("fs");

// Minimal .env reader, so no extra dependency is needed
if (fs.existsSync(".env")) {
  for (const line of fs.readFileSync(".env", "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
const accounts = process.env.DEPLOYER_KEY ? [process.env.DEPLOYER_KEY] : [];

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    baseSepolia: { url: "https://sepolia.base.org", chainId: 84532, accounts },
    base: { url: "https://mainnet.base.org", chainId: 8453, accounts },
  },
  // Source code verification: Sourcify and Blockscout need no API key.
  // For Basescan, add BASESCAN_API_KEY to .env (free at etherscan.io).
  sourcify: { enabled: true },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "blockscout",
      base: process.env.BASESCAN_API_KEY || "blockscout",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: process.env.BASESCAN_API_KEY
          ? { apiURL: "https://api.basescan.org/api", browserURL: "https://basescan.org" }
          : { apiURL: "https://base.blockscout.com/api", browserURL: "https://base.blockscout.com" },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: process.env.BASESCAN_API_KEY
          ? { apiURL: "https://api-sepolia.basescan.org/api", browserURL: "https://sepolia.basescan.org" }
          : { apiURL: "https://base-sepolia.blockscout.com/api", browserURL: "https://base-sepolia.blockscout.com" },
      },
    ],
  },
};
