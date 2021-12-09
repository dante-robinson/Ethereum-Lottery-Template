require("@nomiclabs/hardhat-truffle5");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-kovan.alchemyapi.io/v2/HQmUd_k7_dAjIcjEBmZ9KWfjUkr9JkgL",
        blockNumber: 28581409,
      },
    },
    kovan: {
      url: "https://eth-kovan.alchemyapi.io/v2/HQmUd_k7_dAjIcjEBmZ9KWfjUkr9JkgL",
      accounts: [
        "d18c95a6e5fb21e7189e0900939900baf4505167f5706e33bcef239947aac391",
        "e98b45eec871357df8888fd23894143c265737dc32c1837a1d05f0dfb8f20dfa",
        "d1ff11e4546cc55dd12b7b72cf406ffdd0de800410d3719c84cbcc4a2467a1fd",
      ],
    },
  },
  solidity: {
    version: "0.8.10",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
  },
  mocha: {
    timeout: 20000,
  },
};
