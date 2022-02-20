const Lottery = artifacts.require("Lottery");

module.exports = function (deployer) {
  deployer.deploy(
    Lottery,
    //Cost Per Line 0.1 ETH
    BigInt(100000000000000000),
    //VRF Coordinator Address
    "0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B",
    //Chainlink Key Hash
    "0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311",
    //Chainlink Fee
    BigInt(100000000000000000),
    //LINK Address
    "0x01BE23585060835E02B77ef475b0Cc51aA1e0709",
    //WETH Address
    "0xc778417E063141139Fce010982780140Aa0cD5Ab"
  );
};
