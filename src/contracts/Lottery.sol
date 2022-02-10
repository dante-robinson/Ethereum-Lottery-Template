// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;
pragma abicoder v2;

//import chainlink and uniswap contracts for random number generation
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";

interface IUniswapRouter is ISwapRouter {
    function refundETH() external payable;
}

contract Lottery is VRFConsumerBase {
    //Uniswap needed variables
    IUniswapRouter internal constant uniswapRouter =
        IUniswapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);
    IQuoter internal constant quoter =
        IQuoter(0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6);
    address private WETH9;
    address private LINKAddress;
    uint24 internal uniFee = 3000;
    uint256 public ethAmount;

    //Chainlink VRF Variables
    bytes32 internal keyHash;
    uint256 internal linkFee;
    uint256 internal randomResult;

    //General use case variables
    uint256 public costPerLine;
    mapping(uint256 => uint256[7]) public winningNumbers;
    uint256 public totalPrizePool;
    uint8 public correctNumbers;
    uint256 public dividedPool;
    uint256 public drawNumber;

    //Stores the address of the Prize pool
    address payable public poolOwner;
    mapping(uint256 => mapping(address => bool)) public isAddressEntered;
    mapping(uint256 => mapping(address => uint8[7])) public pickedNumbers;

    //Winning Addresses Array
    address payable[] public sevenCorrect;
    address payable[] public sixCorrect;
    address payable[] public fiveCorrect;
    address payable[] public fourCorrect;
    address payable[] public threeCorrect;

    //Declare Prize Pools
    uint256 public sevenPool;
    uint256 public sixPool;
    uint256 public fivePool;
    uint256 public fourPool;
    uint256 public threePool;

    constructor(
        uint256 _costPerLine,
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _linkFee,
        address _linkAddress,
        address _WETH9
    )
        public
        VRFConsumerBase(
            _vrfCoordinator, // VRF Coordinator address
            _linkAddress // LINK Token address
        )
    {
        poolOwner = payable(msg.sender);
        costPerLine = _costPerLine;

        // Start draw Number at 1
        drawNumber = 1;

        //Set variables
        keyHash = _keyHash;
        linkFee = _linkFee;
        LINKAddress = _linkAddress;
        WETH9 = _WETH9;
    }

    //Only Contract Owner can call this modifier
    modifier restricted() {
        require(msg.sender == poolOwner);
        _;
    }

    //Gets the estimated amount of ETH needed to buy the provided linkFee
    function getEstimatedETHforLINK()
        external
        payable
        restricted
        returns (uint256)
    {
        return
            ethAmount = quoter.quoteExactOutputSingle(
                WETH9,
                LINKAddress,
                uniFee,
                linkFee,
                0
            );
    }

    //Swap ETH to LINK through Uniswap
    function convertEthToExactLINK() external payable restricted {
        //Checks that the entered amount of LINK and value of ETH sent is over 0
        require(
            msg.value > ethAmount,
            "Must pass ETH amount greater than ethAmount"
        );

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: LINKAddress,
                fee: uniFee,
                recipient: address(this),
                deadline: block.timestamp + 15,
                amountIn: msg.value,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        uniswapRouter.exactInputSingle{value: msg.value}(params);
    }

    //Takes in 7 chosen numbers and assigns them to the pickedNumbers mapping.
    function chooseNumbers(
        uint8 _0,
        uint8 _1,
        uint8 _2,
        uint8 _3,
        uint8 _4,
        uint8 _5,
        uint8 _6
    ) public payable {
        // Require chosen numbers to be under 51
        require(_0 < 51);
        require(_1 < 51);
        require(_2 < 51);
        require(_3 < 51);
        require(_4 < 51);
        require(_5 < 51);
        require(_6 < 51);
        // Value in ETH must match costPerLine
        require(msg.value == costPerLine);
        // Must not already be enetered
        require(isAddressEntered[drawNumber][msg.sender] == false);
        isAddressEntered[drawNumber][msg.sender] = true;
        //transfers money to poolOwner
        (bool success, ) = poolOwner.call{value: costPerLine}("");
        require(success, "Transaction failed.");
        totalPrizePool += costPerLine;
        //Assign selected numbers to mapping
        pickedNumbers[drawNumber][msg.sender][0] = _0;
        pickedNumbers[drawNumber][msg.sender][1] = _1;
        pickedNumbers[drawNumber][msg.sender][2] = _2;
        pickedNumbers[drawNumber][msg.sender][3] = _3;
        pickedNumbers[drawNumber][msg.sender][4] = _4;
        pickedNumbers[drawNumber][msg.sender][5] = _5;
        pickedNumbers[drawNumber][msg.sender][6] = _6;
    }

    //Calls Chainlink VRF to start a random Number Request
    function getRandomNumber() public restricted returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= linkFee,
            "Not enough LINK to pay the fee"
        );

        return requestRandomness(keyHash, linkFee);
    }

    //Standard Chainlink VRF function to verify the number is random
    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
    }

    //Expand the number to 7 numbers under 50 and check for duplicates
    function expand() public restricted {
        //subtract the estimated ETH Cost for the LINK from the totalPrizePool
        totalPrizePool -= ethAmount;
        for (uint256 x = 0; x < 7; x++) {
            winningNumbers[drawNumber][x] =
                (uint256(keccak256(abi.encode(randomResult, x))) % 50) +
                1;
            //Checks for Duplicates and gets a new number
            for (uint8 y = 0; y < 7; y++) {
                if (
                    winningNumbers[drawNumber][x] ==
                    winningNumbers[drawNumber][y]
                ) {
                    winningNumbers[drawNumber][x] =
                        (uint256(
                            keccak256(
                                abi.encode(
                                    randomResult,
                                    x,
                                    winningNumbers[drawNumber][x]
                                )
                            )
                        ) % 50) +
                        1;
                }
            }
        }
    }

    /* Check Correct Numbers and add up the total correct answers to the
    correctNumbers variable. Also resets the playerWinningNumbers mapping
    back to a status of false. */
    function checkNumbers() public {
        require(isAddressEntered[drawNumber][msg.sender]);

        //Loop through each arrayAddress in the array
        for (uint8 x = 0; x < 7; x++) {
            for (uint8 y = 0; y < 7; y++) {
                if (
                    pickedNumbers[drawNumber][msg.sender][x] ==
                    winningNumbers[drawNumber][y]
                ) {
                    correctNumbers++;
                    // Needed for testing / same number multiple times
                    break;
                }
            }
        }

        //Add to current prize pool if applicable
        if (correctNumbers == 7) {
            //85% of Prize Pool
            sevenCorrect.push(payable(msg.sender));
        } else if (correctNumbers == 6) {
            //4% of Prize Pool
            sixCorrect.push(payable(msg.sender));
        } else if (correctNumbers == 5) {
            //5% of Prize Pool this is correct as there are more winners
            fiveCorrect.push(payable(msg.sender));
        } else if (correctNumbers == 4) {
            //3% of Prize Pool
            fourCorrect.push(payable(msg.sender));
        } else if (correctNumbers == 3) {
            //2% of Prize Pool
            threeCorrect.push(payable(msg.sender));
        }

        //Reset correctNumbers
        correctNumbers = 0;
    }

    function dividePool() public restricted {
        /* Divides the prize pool into 100 pieces as decimals are not uint in
    solidity. Then distribute 88 pieces to say sevenPool as 88% of the prize
    working the same as doing * 0.88 */
        dividedPool = (totalPrizePool / 100);
        //Using += to carry over previous balance is prize not won
        sevenPool += (dividedPool * 85);
        sixPool += (dividedPool * 4);
        fivePool += (dividedPool * 5);
        fourPool += (dividedPool * 3);
        threePool += (dividedPool * 2);
        //Last 1% of dividedPool is used for gas
    }

    function sevenClaimPrize() public payable restricted {
        // Require someone has 7 numbers correct and value is sevenPool prize money
        require(sevenCorrect.length > 0);
        require(msg.value == sevenPool);

        for (uint256 x = 0; x < sevenCorrect.length; x++) {
            uint256 prize = sevenPool / sevenCorrect.length;
            address payable winner = sevenCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        sevenPool = 0;
    }

    function sixClaimPrize() public payable restricted {
        // Require someone has 6 numbers correct and value is sevenPool prize money
        require(sixCorrect.length > 0);
        require(msg.value == sixPool);

        for (uint256 x = 0; x < sixCorrect.length; x++) {
            uint256 prize = sixPool / sixCorrect.length;
            address payable winner = sixCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        sixPool = 0;
    }

    function fiveClaimPrize() public payable restricted {
        // Require someone has 5 numbers correct and value is sevenPool prize money
        require(fiveCorrect.length > 0);
        require(msg.value == fivePool);

        for (uint256 x = 0; x < fiveCorrect.length; x++) {
            uint256 prize = fivePool / fiveCorrect.length;
            address payable winner = fiveCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        fivePool = 0;
    }

    function fourClaimPrize() public payable restricted {
        // Require someone has 4 numbers correct and value is sevenPool prize money
        require(fourCorrect.length > 0);
        require(msg.value == fourPool);

        for (uint256 x = 0; x < fourCorrect.length; x++) {
            uint256 prize = fourPool / fourCorrect.length;
            address payable winner = fourCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        fourPool = 0;
    }

    function threeClaimPrize() public payable restricted {
        // Require someone has 3 numbers correct and value is sevenPool prize money
        require(threeCorrect.length > 0);
        require(msg.value == threePool);

        for (uint256 x = 0; x < threeCorrect.length; x++) {
            uint256 prize = threePool / threeCorrect.length;
            address payable winner = threeCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        threePool = 0;
    }

    // Resets the winners Arrays and adjusts the new totalPrizePool
    function weeklyReset() public restricted {
        //Reset variables
        totalPrizePool = threePool + fourPool + fivePool + sixPool + sevenPool;
        drawNumber++;
        delete sevenCorrect;
        delete sixCorrect;
        delete fiveCorrect;
        delete fourCorrect;
        delete threeCorrect;
    }
}
