# Lottery Contract

This is my first smart contract made in solidity with a react front end. This contract is not 100%
decentralized and requires an owner address to call a few functions that I will get into. Because of
this fact I do not plan on pushing this to ETH mainnet and will just be leaving it on testnet. Feel free
to adjust this contract as you wish as it is open sourced with an MIT License.

## How it works

1. Contract Deployed
2. Player chooses numbers
3. Contract get an estimated amount of ETH needed to
4. swap for the specified LINK Fee in the constructor
5. Use estimated fee to convert ETH to LINK
6. Get a random number from Chainlink Oracle
7. Expand the random number into 7 numbers
8. Then players can check there numbers to the 7 winning chosen numbers
9. Contact will then divide the total prize pool
10. Run the claim prize function for each prize if someone has won
11. Reset the variables

The linkFee needed for each network can be found on Chainlink's website here as well as the VRF
and keyHash you will need. The LINK Address should be the same.

`https://docs.chain.link/docs/vrf-contracts/`

Generating a random number using keccak256 is guessable for example using

`(keccak256(block.difficulty, now))`

this takes in the current difficulty and the current time and we can guess or collude with miners to
get the block difficulty and as mentioned in the next section of issues since the deployer needs to call
functions to generate the number this is most likely done through a script that will get numbers at the
same time. We can then take this data into a keccak256 encoder ourselves to get the output and use
modulus on the number to get the upcoming number and enter the lottery with such numbers. This is
unlikely to happen but if you have say a 50 million dollar prize pool this becomes a lot more likely for
someone to want to get the right numbers to win the money.

To solve this Issue this contract uses Chainlink VRF which basically sends a request to a Chainlink
oracle for a random number. The oracle then comes up with a number and cryptographic proof by
combining block data that is unknown at the time of the request with the oracle node’s private key.
The number is sent to the Chainlink VRF Contract and must then be verified that it is in fact random
before it is sent back to our Lottery Contract therefore we must wait some time before for the number
to return back to Lottery before calling the expand function. In the case of a node being corrupt or compromised, it cannot supply biased answers as the on-chain cryptographic proof would fail.

The expand function does use a keccak256 encoder however this method does not have the same issue
mentioned above because the provided thing to be encoded is the randomResult which is unknown
with the number provided by the for loop. This gets encoded into a bytes variable which then gets
encoded to through keccak256 and the numbers returned then get modulus 50 applied to it to get a
number between 0 and 49 so +1 is added to go to 1 and 50. Each number is different because of the
number provided by the for loop value in the off chance the number is the same expand will check
and come up with a new result.

The numbers that are recorded have a drawNumber attached to them meaning, that you can call this
data to the UI and the data is stored on the blockchain and you won't require any server space to
store it.

## Issues

As mentioned at the beginning this contract is not 100% decentralized and has multiple points of
centralization. This contract in it's current state requires the deployer address to call some functions
to complete the lottery cycle. The only way to address this would be to automate the function calls
inside the solidity script however from my knowledge this is not possible at this time. This issue
allows the deployer to become a bad actor and run away with the prize pool without calling any other
functions, in theory you could send the money to the Contract instead of to the owner/deployer but
then the uniswap function wont work without the owner calling it having the ETH causing another
gas charge. Not only that but since the owner deployed the contract whats preventing them from
spending the money. The counter argument to this would be send the money to the contract but as I
mentioned you would need to send the estimated ETH needed to convert to LINK to the owner to do
the swap so what's stopping the bad actor to just recall that function over and over until it's empty it
doesn't really change anything so I didn't do that in this contract.

## Things that can be changed

I wasn't sure which way could be cheaper across large scale and small scale, currently the way the
contract is setup is to get a random set of numbers and then have the players call the checkNumbers
function within a certain time frame in my case a week before the deployer calls dividePool and the
claim prizes function. It may be cheaper to have the contract check everyone's numbers for them so
if they don't check their numbers within the given time frame the ticket isn't just no longer valid. The
way to do this in my eyes though is to switch the mapping to an array of addresses and on large scale
the gas cost of iterating over that array will be very costly and may need more than 1% of the prize
pool dedicated to gas.

You can also add a require statement to expand() if you wish to require that the randomResult is
greater than 0 to prevent calling expand before a random number has returned, however the test.js
file will fail because it relies on that randomResult being 0.

This contract is using ganache and the tests can be run by first getting an API KEY from ALCHEMY or INFURA and starting a forked network with ganache-cli by running

`ganache-cli --fork APILINK`

with your API LINK. Then you can run in a seperate terminal window

`truffle test`

If you would like to deploy the project you will need to create a .env file in the root directory and put 3 variables in it with these names

```
ALCHEMY_API = "JUST YOUR API KEY NOT THE ENTIRE LINK"
DEPLOYER_KEY = "YOUR PRIVATE KEY"
ETHERSCAN_API = "ETHERSCAN API KEY"
```

then you should be able to run

`truffle migrate --network rinkeby`

if you need any test ETH for rinkeby checkout the chainlink faucet here - https://faucets.chain.link/rinkeby

## Things not finished

React Front End
