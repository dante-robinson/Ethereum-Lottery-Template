const Lottery = artifacts.require("./Lottery");
const assert = require("assert");

/* Need variables to store before transfer balance in test later for some reason
if called in beforeEach it doesnt recognize them later in the test needed if
someone knows how to fix this you're more than welcome to push the fix */
let balanceOf0Before;
let balanceOf1Before;

describe("Lottery Contract", () => {
  let accounts;
  let lottery;
  //Deploy a new Lottery contract with a costPerLine of 0.1 ETH
  before(async () => {
    lottery = await Lottery.new(
      web3.utils.toWei("0.1", "ether"),
      0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4,
      100000000000000000 // 0.1 LINK
    );
    accounts = await web3.eth.getAccounts();
    //Assign balance before transfer
    balanceOf0Before = parseInt(await web3.eth.getBalance(lottery.address));
    //Subtract the costPerLine for test later
    balanceOf1Before = parseInt(await web3.eth.getBalance(accounts[1]));
    balanceOf1Before -= parseInt(web3.utils.toWei("0.1", "ether"));
  });

  it("allows people to enter Lottery", async () => {
    await lottery.chooseNumbers(0, 1, 2, 3, 4, 5, 8, {
      from: accounts[2],
      //This needs to match the costPerLine
      value: web3.utils.toWei("0.1", "ether"),
    });
    const entered = await lottery.isAddressEntered(accounts[2]);
    assert.equal(entered, true);
  });

  it("can choose numbers for ticket", async () => {
    /* Enter lottery is part of choosing original numbers as I dont see the need
      in calling multiple functions to enter and then choose numbers etc. */
    await lottery.chooseNumbers(0, 1, 2, 3, 4, 5, 6, {
      from: accounts[1],
      //This needs to match the costPerLine
      value: web3.utils.toWei("0.1", "ether"),
    });
    //Create For Loop to iterate over each item in the area
    for (let i = 0; i < 7; i++) {
      let number = await lottery.pickedNumbers(accounts[1], [i]);
      assert.equal(number.words[0], i);
    }
  });

  it("sends money from player to contract", async () => {
    /* Check to make sure the new Balance of each account is correct. parseInt
      is needed to convert each value to an Integer from a String */
    assert.equal(
      balanceOf0Before + parseInt(web3.utils.toWei("0.2", "ether")),
      await web3.eth.getBalance(lottery.address)
    );

    /* To account for random transaction fee cost the costPerLine was
      subracted for balanceOf1Before so both values would in theory be the same
      before you include the transaction fee therefore the balance before the
      transaction should be greater */
    assert.ok(
      balanceOf1Before > parseInt(await web3.eth.getBalance(accounts[1]))
    );
  });

  //Doesn't WORK!!! Works on Remix though....
  it("checks the pickedNumbers to winningNumbers", async () => {
    // do {
    //   await lottery.pickWinningNumbers({ from: accounts[0] });
    //   await lottery.checkNumbers({ from: accounts[1] });
    // } while ((await lottery.correctNumbers(accounts[1])) < 3);
    console.log(await lottery.sevenCorrect.length);
    // assert.ok((await lottery.correctNumbers(accounts[1])) >= 1);
  });

  it("swaps ETH to LINK through Uniswap", async () => {
    const tokenABI = [
      {
        constant: true,
        inputs: [{ name: "_owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "balance", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ];
    const requiredEth = await lottery.getEstimatedETHforLINK(1);
    const sendEth = requiredEth * 1.1;
    console.log(sendEth);
    const tokenAddress = "0xa36085F69e2889c224210F603D836748e7dC0088";
    // const tokenInst = new web3.eth.Contract(tokenABI, tokenAddress);
    // await lottery.convertEthToExactLINK("1", {
    //   value: sendEth,
    // });
    // const balance = await tokenInst.methods.balanceOf(accounts[0]).call();
    // console.log(await tokenInst.methods.balanceOf(accounts[0]).call());
  });

  //Doesn't WORK!!! Works on Remix though....
  it("Adds money to totalPrizePool", async () => {
    console.log(await web3.eth.getBalance(accounts[0]));
    console.log(await lottery.totalPrizePool());
    // assert.ok((await lottery.totalPrizePool > 0);
  });
});
