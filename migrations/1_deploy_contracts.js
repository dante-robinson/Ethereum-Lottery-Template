const Lottery = artifacts.require("Lottery");

module.exports = async () => {
  //Amount in .toWei is the costPerLine
  const lottery = await Lottery.new(
    web3.utils.toWei("0.1", "ether"),
    0xdd3782915140c8f3b190b5d67eac6dc5760c46e9,
    0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4,
    100000000000000000 // 0.1 LINK
  );
  Lottery.setAsDeployed(lottery);
};
