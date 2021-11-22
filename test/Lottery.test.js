const Lottery = artifacts.require("./Lottery");
const assert = require("assert");

contract("Lottery", (accounts) => {
  let lottery;

  beforeEach(async () => {
    lottery = await Lottery.new();
    await lottery.enterLottery({ from: accounts[1] });
  });

  describe("Lottery Contract", () => {
    it("allows people to enter Lottery", async () => {
      const entered = await lottery.enteredAddress(accounts[1]);
      assert.equal(entered, true);
    });

    it("can choose numbers for ticket", async () => {
      await lottery.chooseNumbers(0, 1, 2, 3, 4, 5, 6, { from: accounts[1] });
      //Create For Loop to iterate over each item in the area
      for (let i = 0; i < 7; i++) {
        let number = await lottery.pickedNumbers(accounts[1], [i]);
        assert.equal(number.words[0], i);
      }
    });
  });
});
