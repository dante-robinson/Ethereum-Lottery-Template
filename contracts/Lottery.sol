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
    address private constant WETH9 = 0xd0A1E359811322d97991E03f863a0C30C2cF029C;
    address private constant LINKAddress =
        0xa36085F69e2889c224210F603D836748e7dC0088;
    uint24 internal uniFee = 3000;
    uint256 public ethAmount;

    //Chainlink VRF Variables
    bytes32 internal keyHash;
    uint256 internal linkFee;
    uint256 public randomResult;
    address internal vrfCoordinator = 0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9;

    //General use case variables
    uint256 public costPerLine;
    uint256[7] public winningNumbers;
    uint256 public totalPrizePool;

    //Stores the address of the Prize pool
    address payable public poolOwner;
    mapping(address => bool) internal isAddressEntered;
    mapping(address => uint8[7]) public pickedNumbers;
    mapping(address => uint8) internal correctNumbers;

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
        bytes32 _keyHash,
        uint256 _linkFee
    )
        public
        VRFConsumerBase(
            vrfCoordinator, // VRF Coordinator address
            LINKAddress // LINK Token address
        )
    {
        poolOwner = payable(msg.sender);
        costPerLine = _costPerLine;

        //Kovan keyHash
        keyHash = _keyHash;
        linkFee = _linkFee; // 0.1 LINK
    }

    //Only Contract Owner can call this modifier
    modifier restricted() {
        require(msg.sender == poolOwner);
        _;
    }

    //Gets the estimated amount of ETH needed to buy X amount of LINK
    function getEstimatedETHforLINK(uint256 linkAmount)
        external
        payable
        restricted
        returns (uint256)
    {
        address tokenIn = WETH9;
        address tokenOut = LINKAddress;
        uint24 fee = uniFee;
        uint160 sqrtPriceLimitX96 = 0;

        return
            ethAmount = quoter.quoteExactOutputSingle(
                tokenIn,
                tokenOut,
                fee,
                linkAmount,
                sqrtPriceLimitX96
            );
    }

    //Swap ETH to LINK through Uniswap
    function convertEthToExactLINK(uint256 linkAmount)
        external
        payable
        restricted
    {
        //Checks that the entered amount of LINK and value of ETH sent is over 0
        require(linkAmount > 0, "Must pass non 0 LINK amount");
        require(msg.value > ethAmount, "Must pass non 0 ETH amount");

        uint256 deadline = block.timestamp + 15;
        address tokenIn = WETH9;
        address tokenOut = LINKAddress;
        uint24 fee = uniFee;
        address recipient = address(this);
        uint256 amountOut = linkAmount;
        uint256 amountInMaximum = msg.value;
        uint160 sqrtPriceLimitX96 = 0;

        ISwapRouter.ExactOutputSingleParams memory params = ISwapRouter
            .ExactOutputSingleParams(
                tokenIn,
                tokenOut,
                fee,
                recipient,
                deadline,
                amountOut,
                amountInMaximum,
                sqrtPriceLimitX96
            );

        uniswapRouter.exactOutputSingle{value: msg.value}(params);
    }

    //Needed to refund leftover ETH
    receive() external payable {}

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
        require(msg.value == costPerLine);
        require(isAddressEntered[msg.sender] == false);
        isAddressEntered[msg.sender] = true;
        //transfers money to poolOwner
        (bool success, ) = poolOwner.call{value: costPerLine}("");
        require(success, "Transaction failed.");
        totalPrizePool += costPerLine;
        //Assign selected numbers to mapping
        pickedNumbers[msg.sender][0] = _0;
        pickedNumbers[msg.sender][1] = _1;
        pickedNumbers[msg.sender][2] = _2;
        pickedNumbers[msg.sender][3] = _3;
        pickedNumbers[msg.sender][4] = _4;
        pickedNumbers[msg.sender][5] = _5;
        pickedNumbers[msg.sender][6] = _6;
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
        for (uint256 x= 0; x < 7; x++) {
            winningNumbers[x] = (uint256(keccak256(abi.encode(randomResult, x))) % 50) + 1;
            //Checks for Duplicates and gets a new number
             for(uint8 y = 0; y < 7; y++){
                if (winningNumbers[x] == winningNumbers[y]) {
                winningNumbers[x] = (uint256(keccak256(abi.encode(randomResult, x))) % 50) + 1;
                }
            }
        }
    }

    /* Check Correct Numbers and add up the total correct answers to the
    correctNumbers variable. Also resets the playerWinningNumbers mapping
    back to a status of false. */
    function checkNumbers() public {
        require(isAddressEntered[msg.sender]);

        //Loop through each arrayAddress in the array
        for (uint256 x = 0; x < 7; x++) {
            for(uint8 y = 0; y < 7; y++){
                if (pickedNumbers[msg.sender][x] == winningNumbers[y]) {
                correctNumbers[msg.sender]++;
                }
            }
        }

        //Add 1 to current prize pool if applicable
        if (correctNumbers[msg.sender] == 7) {
            //85% of Prize Pool
            sevenCorrect.push(payable(msg.sender));
        } else if (correctNumbers[msg.sender] == 6) {
            //4% of Prize Pool
            sixCorrect.push(payable(msg.sender));
        } else if (correctNumbers[msg.sender] == 5) {
            //5% of Prize Pool this is correct as there are more winners
            fiveCorrect.push(payable(msg.sender));
        } else if (correctNumbers[msg.sender] == 4) {
            //3% of Prize Pool
            fourCorrect.push(payable(msg.sender));
        } else if (correctNumbers[msg.sender] == 3) {
            //2% of Prize Pool
            threeCorrect.push(payable(msg.sender));
        }

        //Reset isAddressEntered & correctNumbers
        isAddressEntered[msg.sender] = false;
        correctNumbers[msg.sender] = 0;
    }

    //Distributes Prize and resets contract
    function weeklyReset() public payable restricted {
        //require balance of the current totalPrizePool plus remaining balances from other pools
        require(msg.value >= (totalPrizePool + sevenPool + sixPool + fivePool + fourPool + threePool));
        /* Divides the prize pool into 100 pieces as decimals are not uint in
        solidity. Then distribute 88 pieces to say sevenPool as 88% of the prize
        working the same as doing * 0.88 */
        uint256 dividedPool = (totalPrizePool / 100);
        //Using += to carry over previous balance is prize not won
        sevenPool += (dividedPool * 85);
        sixPool += (dividedPool * 4);
        fivePool +=  (dividedPool * 5);
        fourPool += (dividedPool * 3);
        threePool += (dividedPool * 2);
        //Last 1% of dividedPool is used for gas

        //Create variables for use in for loops
        uint256 totalSeven = sevenCorrect.length;
        uint256 totalSix = sixCorrect.length;
        uint256 totalFive = fiveCorrect.length;
        uint256 totalFour = fourCorrect.length;
        uint256 totalThree = threeCorrect.length;

        /* If using .length property then the for loop will not complete because
        after each run the account is deleted from the array and paid as x grows
        in value to loop through array .length would be shrinking not paying out
        everyone therefore a static variable is needed */
        for (uint256 x = 0; x < totalSeven; x++) {
            uint256 prize = sevenPool / totalSeven;
            address payable winner = sevenCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        for (uint256 x = 0; x < totalSix; x++) {
            uint256 prize = sixPool / totalSix;
            address payable winner = sixCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        for (uint256 x = 0; x < totalFive; x++) {
            uint256 prize = fivePool / totalFive;
            address payable winner = fiveCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        for (uint256 x = 0; x < totalFour; x++) {
            uint256 prize = fourPool / totalFour;
            address payable winner = fourCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        for (uint256 x = 0; x < totalThree; x++) {
            uint256 prize = threePool / totalThree;
            address payable winner = threeCorrect[x];
            (bool success, ) = winner.call{value: prize}("");
            require(success, "Transaction failed.");
        }
        //Reset variables
        totalPrizePool = 0;
        delete sevenCorrect;
        delete sixCorrect;
        delete fiveCorrect;
        delete fourCorrect;
        delete threeCorrect;
    }
}
