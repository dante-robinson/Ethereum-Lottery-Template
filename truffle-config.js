require("dotenv").config();
const HDWalletProvider = require("truffle-hdwallet-provider-privkey");
const privateKey = [process.env.DEPLOYER_KEY];

module.exports = {
  contracts_directory: "./src/contracts/",
  contracts_build_directory: "./src/artifacts",
  networks: {
    development: {
      host: "127.0.0.1", // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: "*", // Any network (default: none)
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(
          privateKey,
          `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API}`
        );
      },
      network_id: 4,
    },
  },

  compilers: {
    solc: {
      version: "0.8.10",
      enabled: true,
      runs: 200000,
    },
  },
};
