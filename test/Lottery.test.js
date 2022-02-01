const Lottery = artifacts.require("./Lottery.sol");
const assert = require("assert");

/* Need variables to store before transfer balance in test later for some reason
if called in beforeEach it doesnt recognize them later in the test needed if
someone knows how to fix this you're more than welcome to push the fix */
let balanceOf0Before;
let balanceOf1Before;

describe("Lottery Contract", () => {
  let accounts;
  let lottery;
  let link;
  let drawNumber;
  // Deploy a new Lottery contract with a costPerLine of 0.1 ETH
  before(async () => {
    accounts = await web3.eth.getAccounts();

    // Deploy Lottery Contract
    lottery = await new web3.eth.Contract(Lottery.abi)
      .deploy({
        data: Lottery.bytecode,
        arguments: [
          web3.utils.toWei("0.1", "ether"),
          "0xdd3782915140c8f3b190b5d67eac6dc5760c46e9",
          "0x6c3699283bda56ad74f6b855546325b68d482e983852a7a82979cc4807b641f4",
          BigInt(100000000000000000),
        ],
      })
      .send({ from: accounts[0] });

    drawNumber = await lottery.methods.drawNumber().call();

    //Deploy balanceOf from LINK Contract
    const linkABI = [
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
    const LINKAddress = "0xa36085f69e2889c224210f603d836748e7dc0088";
    link = await new web3.eth.Contract(linkABI, LINKAddress);

    // Assign balance before transfer
    balanceOf0Before = parseInt(await web3.eth.getBalance(accounts[0]));
    // Subtract the costPerLine for test later
    balanceOf1Before = parseInt(await web3.eth.getBalance(accounts[1]));
  });

  it("allows people to enter Lottery", async () => {
    await lottery.methods.chooseNumbers(47, 16, 18, 6, 49, 24, 36).send({
      from: accounts[2],
      // This needs to match the costPerLine
      value: web3.utils.toWei("0.1", "ether"),
    });
    assert.equal(
      await lottery.methods.isAddressEntered(drawNumber, accounts[2]).call(),
      true
    );
  });

  it("can choose numbers for ticket", async () => {
    /* Enter lottery is part of choosing original numbers as I dont see the need
      in calling multiple functions to enter and then choose numbers etc. */
    await lottery.methods.chooseNumbers(49, 47, 18, 16, 6, 36, 24).send({
      from: accounts[1],
      //This needs to match the costPerLine
      value: web3.utils.toWei("0.1", "ether"),
    });

    // Create and array of the chosen Numbers
    const array = [49, 47, 18, 16, 6, 36, 24];

    // Create For Loop to iterate over each item in the area
    for (let i = 0; i < 7; i++) {
      assert.equal(
        await lottery.methods.pickedNumbers(drawNumber, accounts[1], i).call(),
        array[i]
      );
    }
  });

  it("adds money to totalPrizePool", async () => {
    assert.ok((await lottery.methods.totalPrizePool().call()) > 0);
  });

  it("sends money from player to owner", async () => {
    /* Check to make sure the new Balance of each account is correct. parseInt
      is needed to convert each value to an Integer from a String */
    assert.ok(
      // Technically its +0.2 ether from bothe transactions but to consider other gas checking 0.1
      balanceOf0Before + parseInt(web3.utils.toWei("0.1", "ether")) <
        parseInt(await web3.eth.getBalance(accounts[0]))
    );

    /* To account for random transaction fee cost the costPerLine is
      subracted for balanceOf1Before so both values would in theory be the same
      before you include the transaction fee therefore the balance before the
      transaction should be greater */
    assert.ok(
      (balanceOf1Before -=
        parseInt(web3.utils.toWei("0.1", "ether")) >
        parseInt(await web3.eth.getBalance(accounts[1])))
    );
  });

  it("gets estimated ETH needed for linkFee then converts ETH to LINK", async () => {
    await lottery.methods.getEstimatedETHforLINK().send({ from: accounts[0] });
    let ethAmount = await lottery.methods.ethAmount().call();

    await lottery.methods.convertEthToExactLINK().send({
      from: accounts[0],
      value: parseInt(ethAmount * 1.1),
    });

    assert.ok(
      parseInt(await link.methods.balanceOf(lottery.options.address).call()) >
        BigInt(100000000000000000) // 0.1 LINk
    );
  });

  it("executes getRandomNumber and expands the number array", async () => {
    // As mentioned above doesnt work as its not connected to a Chainlink Oracle Node
    await lottery.methods.getRandomNumber().send({ from: accounts[0] });
    await lottery.methods.expand().send({ from: accounts[0] });
    // Only checking first number is equal to 18 as the rest can be assumed also changed
    assert.ok(
      (await lottery.methods.winningNumbers(drawNumber, 0).call()) == 47
    );
  });

  /* Not 100% Reliable as its a fork of Kovan it draws the same numbers every time on Remix
   uploaded to Kovan this is not as issue, Test checks accounts are added to correct array only */
  it("checks the pickedNumbers to winningNumbers", async () => {
    await lottery.methods.checkNumbers().send({ from: accounts[2] });
    //Same Numbers in all different positions to check order doesn't matter
    await lottery.methods.checkNumbers().send({ from: accounts[1] });

    assert.equal(await lottery.methods.sevenCorrect(0).call(), accounts[2]);
    assert.equal(await lottery.methods.sevenCorrect(1).call(), accounts[1]);
  });

  it("distributes the totalPrizePool to winners", async () => {
    // split the totalPrizePool into smaller pools
    await lottery.methods.dividePool().send({ from: accounts[0] });

    // Get ETH balance for account 1 and 2
    balanceOne = await web3.eth.getBalance(accounts[1]);
    balanceTwo = await web3.eth.getBalance(accounts[2]);

    // Only claiming seven correct numbers as I didn't have any accounts win other prizes
    await lottery.methods.sevenClaimPrize().send({
      from: accounts[0],
      value: await lottery.methods.sevenPool().call(),
    });

    // Checks that the prize in sevenPool is 0
    assert.equal(await lottery.methods.sevenPool().call(), 0);
    // Checks that the balance in account 1 and 2 have increased
    assert.ok(balanceOne < (await web3.eth.getBalance(accounts[1])));
    assert.ok(balanceTwo < (await web3.eth.getBalance(accounts[2])));
  });

  it("removes winners from arrays", async () => {
    await lottery.methods.weeklyReset().send({ from: accounts[0] });
    // manually reset the test drawNumber variable after calling weeklyReset
    drawNumber = await lottery.methods.drawNumber().call();
    /* The line below should fail when uncommented meaning it works
     assert(await lottery.methods.sevenCorrect(0).call()); */
    assert.equal(await lottery.methods.sevenCorrect.length, 0);
  });

  it("keeps not claimed/won prizes for next draw", async () => {
    assert.ok(balanceOf0Before < (await web3.eth.getBalance(accounts[0])));
    // Should be around 0.028 ether remaining after 85% given to sevenPool winners and 1% for fees
    assert.ok(
      (await lottery.methods.totalPrizePool().call()) >
        web3.utils.toWei("0.027", "ether")
    );
  });

  it("adds new money added to prize pool with not won prizes", async () => {
    // Re-enter the lottery for the next draw
    await lottery.methods.chooseNumbers(47, 16, 18, 6, 49, 24, 36).send({
      from: accounts[1],
      //This needs to match the costPerLine
      value: web3.utils.toWei("0.1", "ether"),
    });
    /* Now in real world it would auto call a new number and expand it but in this case I'm just gonna
     leave it the same */
    await lottery.methods.checkNumbers().send({ from: accounts[1] });
    // Just dividing the prize pool up now and we can then check the older not won prizes
    await lottery.methods.dividePool().send({ from: accounts[0] });
    /* 0.008 ether from last draw + 4% of the 0.1 we just added should be over 0.012 ether not all 1%
     of gas was used so that remainder is readded to next draw making it not exactly 0.012 */
    assert.ok(
      (await lottery.methods.sixPool().call()) >=
        web3.utils.toWei("0.012", "ether")
    );
  });

  it("changes drawNumber and doesn't let user use old number in new draw", async () => {
    // using the numbers called from the last it statement we can just reset the contract and try using it
    await lottery.methods.weeklyReset().send({ from: accounts[0] });
    // manually reset the test drawNumber variable after calling weeklyReset
    drawNumber = await lottery.methods.drawNumber().call();
    // The line below when uncommented should fail
    // await lottery.methods.checkNumbers().send({ from: accounts[1] });
    assert.equal(
      await lottery.methods.pickedNumbers(drawNumber, accounts[1], 0).call(),
      0
    );
  });
});
