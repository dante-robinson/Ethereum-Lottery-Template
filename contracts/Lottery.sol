pragma solidity ^0.8.10;

contract Lottery {
    uint256 public costPerLine;
    uint8[7] public winningNumbers;
    mapping(address => bool) public enteredAddress;
    mapping(address => uint8[7]) public pickedNumbers;
    mapping(address => mapping(uint8 => bool)) public playerWinningNumbers;
    uint8 index;
    bool wonFreeTicket;

    constructor() {}

    function enterLottery() public payable {
        require(enteredAddress[msg.sender] == false);
        enteredAddress[msg.sender] = true;
    }

    // Takes in 7 chosen numbers and assigns them to the pickedNumbers mapping.
    //TRY CLEANING UP
    function chooseNumbers(
        uint8 _0,
        uint8 _1,
        uint8 _2,
        uint8 _3,
        uint8 _4,
        uint8 _5,
        uint8 _6
    ) public payable {
        pickedNumbers[msg.sender][0] = _0;
        pickedNumbers[msg.sender][1] = _1;
        pickedNumbers[msg.sender][2] = _2;
        pickedNumbers[msg.sender][3] = _3;
        pickedNumbers[msg.sender][4] = _4;
        pickedNumbers[msg.sender][5] = _5;
        pickedNumbers[msg.sender][6] = _6;
    }

    //NEEDS WORK! UNFINISHED
    /* function pickWinningNumbers() view {
        uint8 randomNumber;
        keccak256(randomNumber);
    } */

    /* Check Correct Numbers and add up the total correct answers to the
    correctNumbers variable. Also resets the playerWinningNumbers mapping
    back to a status of false. */
    //TRY CLEANING UP
    function checkNumbers(
        uint8 _0,
        uint8 _1,
        uint8 _2,
        uint8 _3,
        uint8 _4,
        uint8 _5,
        uint8 _6
    ) public payable {
        if (_0 == winningNumbers[0]) {
            playerWinningNumbers[msg.sender][0] = true;
        }
        if (_1 == winningNumbers[1]) {
            playerWinningNumbers[msg.sender][1] = true;
        }
        if (_2 == winningNumbers[2]) {
            playerWinningNumbers[msg.sender][2] = true;
        }
        if (_3 == winningNumbers[3]) {
            playerWinningNumbers[msg.sender][3] = true;
        }
        if (_4 == winningNumbers[4]) {
            playerWinningNumbers[msg.sender][4] = true;
        }
        if (_5 == winningNumbers[5]) {
            playerWinningNumbers[msg.sender][5] = true;
        }
        if (_6 == winningNumbers[6]) {
            playerWinningNumbers[msg.sender][6] = true;
        }

        uint8 correctNumbers;
        correctNumbers = 0;

        for (index = 0; index < 7; index++) {
            require(correctNumbers == 0);
            if (playerWinningNumbers[msg.sender][index] == true) {
                correctNumbers++;
                playerWinningNumbers[msg.sender][index] == false;
            }
        }

        if (correctNumbers == 3) {
            //FREE TICKET
        }
        if (correctNumbers == 4) {
            //20 Dollars
        }
        if (correctNumbers == 5) {
            //3.5% of Prize Pool
        }
        if (correctNumbers == 6) {
            //2.5% of Prize Pool
        }
        if (correctNumbers == 7) {
            //87.25% of Prize Pool
        }
    }

    /* function freeTicket() {
        require(wonFreeTicket == true);
        //RNG Random set of Numbers similar to how winningNumbers is generated
    }

    function weeklyReset() {

    } */
}
