// Deploys contracts/Nova.sol.
//   npx hardhat run scripts/deploy.js --network baseSepolia
// Needs DEPLOYER_KEY in .env, and a little ETH on that network for gas.
// Optional: LOGO_URI in .env (the logo link stored in the contract).
const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const net = hre.network.name;
  if (net === "hardhat") throw new Error("Pick a network, e.g. --network baseSepolia");
  if (!process.env.DEPLOYER_KEY) throw new Error("Add DEPLOYER_KEY=0x... to .env");

  const provider = new ethers.BrowserProvider(hre.network.provider);
  const signer = await provider.getSigner();
  const from = await signer.getAddress();
  const balance = await provider.getBalance(from);
  console.log(`Network:  ${net}`);
  console.log(`Deployer: ${from}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} ETH`);
  if (balance === 0n) throw new Error("The deployer has no ETH for gas on this network");

  const logo = process.env.LOGO_URI || "";
  const art = await hre.artifacts.readArtifact("Nova");
  const factory = new ethers.ContractFactory(art.abi, art.bytecode, signer);
  const nova = await factory.deploy(logo);
  console.log(`Sent:     ${nova.deploymentTransaction().hash}`);
  await nova.waitForDeployment();
  const address = await nova.getAddress();
  console.log(`\nNova deployed at ${address}`);
  console.log(`\nNext: verify the source code with`);
  console.log(`  npx hardhat verify --network ${net} ${address} "${logo}"`);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
