// Only used to compile and test the contract locally (npm test).
// Deploying is done with Remix: see README.md.
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
};
