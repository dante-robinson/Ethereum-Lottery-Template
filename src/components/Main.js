import React, { useState, useEffect } from "react";
import "./Main.css";
import env from "react-dotenv";
import axios from "axios";

const Main = ({ lottery }) => {
  const [totalPrizePool, setTotalPrizePool] = useState(null);
  const [pastNumbers, setWinningNumbers] = useState(null);
  const [timeTillDraw, setTimeTillDraw] = useState({});
  //Only Dynamic incase re-deployed
  const [lotteryWallet, setLotteryWallet] = useState(null);
  const [lotteryAddress, setLotteryAddress] = useState(null);
  //Set value in advance to avoid error when mapping over array
  const [previousWinners, setPreviousWinners] = useState([]);

  const getTotalPrizePool = async (total) => {
    total = await lottery.methods.totalPrizePool().call();
    return setTotalPrizePool(total);
  };

  const getWinningNumbers = async (numbers = "") => {
    let draw = await lottery.methods.drawNumber().call();
    for (let i = 0; i < 7; i++) {
      if (numbers === "") {
        numbers = `${await lottery.methods.winningNumbers(draw, i).call()}`;
      } else {
        numbers = `${numbers}, ${await lottery.methods
          .winningNumbers(draw, i)
          .call()}`;
      }
    }
    return setWinningNumbers(numbers);
  };

  const getTimeTillDraw = () => {
    const currentDate = new Date(Date.now());
    const draw = new Date("February 11, 2022 0:00:00");
    const difference = draw - currentDate;

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return setTimeTillDraw(timeLeft);
  };

  const getLotteryWallet = async (wallet) => {
    wallet = await lottery.methods.poolOwner().call();
    return setLotteryWallet(wallet);
  };

  const getLotteryAddress = async (address) => {
    address = await lottery.options.address;
    return setLotteryAddress(address);
  };

  const getPreviousWinners = async (winners = []) => {
    // Contract
    const address = await lottery.options.address;
    // Lottery Wallet
    const wallet = await lottery.methods.poolOwner().call();

    const etherscan =
      "https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=" +
      wallet +
      "&startblock=10113432&endblock=99999999&page=1&offset=10&sort=asc&apikey=" +
      env.ETHERSCAN_API;

    axios.get(etherscan).then((response) => {
      const result = response.data.result;
      for (let i = 0; i < result.length; i++) {
        if (
          result[i].to === "0x01be23585060835e02b77ef475b0cc51aa1e0709" ||
          result[i].to === "0xb3dccb4cf7a26f6cf6b120cf5a73875b7bbc655b" ||
          result[i].to === "0xe592427a0aece92de3cdee1f18e0157c05861564" ||
          result[i].to === "0xb27308f9f90d607463bb33ea1bebb41c27cE5ab6" ||
          result[i].to === wallet.toLowerCase() ||
          result[i].to === address.toLowerCase() ||
          result[i].to === "" ||
          result[i] === undefined
        ) {
        } else {
          winners.push({
            to: result[i].to,
            hash: "https://rinkeby.etherscan.io/tx/" + result[i].hash,
          });
        }
      }
    });
    if (winners.length) {
      return setPreviousWinners((previousWinners) => [winners]);
    }
  };

  useEffect(() => {
    getTotalPrizePool();
    getWinningNumbers();
    getLotteryWallet();
    getLotteryAddress();
    getPreviousWinners();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      getTimeTillDraw();
    }, 1000);
  }, [timeTillDraw]);

  const returnPreviousWinners = previousWinners
    .slice(1, 10)
    .map((winner, index) => {
      return (
        <ul>
          <li key={index}>
            <a href={winner.hash}> {winner.to}</a>
          </li>
        </ul>
      );
    });

  return (
    <div className="container">
      <div>
        <h1 className="mainHeader ui header">Crypto Lottery</h1>
      </div>
      <div className="currentHeader">
        <div className="ui medium header">Current Prize Pool</div>
        <p>{totalPrizePool}</p>
      </div>
      <div className="timeHeader">
        <div className="ui medium header">Time left until next draw</div>
        <h5 className="ui header">Days | Hours | Minutes | Seconds </h5>
        <p className="days">{timeTillDraw.days}</p>
        <p className="hours">{timeTillDraw.hours}</p>
        <p className="minutes">{timeTillDraw.minutes}</p>
        <p className="seconds">{timeTillDraw.seconds}</p>
      </div>
      <div className="numberHeader">
        <div className="ui medium header">Previous winning numbers</div>
        <p>{pastNumbers}</p>
      </div>
      <button className="ui button">Enter Lottery</button>

      <div className="worksHeader ui medium header">How it works</div>
      <p className="worksParagraph">
        You the player can enter the lottery by choosing 7 numbers between 1 and
        50 and then will pay for the transaction fee as well as the cost of the
        lottery ticket (0.1 ETH). The money is sent to the designated lottery
        address where the ether is stored until the next draw. The contract will
        contact Chainlinks oracle to get 7 randomly generated numbers back. The
        player will then need to check the numbers they chose against the drawn
        winning numbers before the next draw (1 week) as the ticket will then be
        void (
        <b>
          Note that you will need to pay a transaction fee to check your numbers
        </b>
        ). You will not recieve a prize until the following draw however you are
        able to enter the next draw right after checking your numbers if you
        choose. Once the contract goes to get the next 7 random numbers for the
        next draw the following week the contract will also payout all the
        winners of the previous draw these transactions can be verified by
        checking the lottery address listed below.
      </p>

      <div className="devHeader">
        <div className="ui medium header">Developer Wallet</div>
        <p>0x31F7F75D12248892202aC9CC32DA5dEFc5B09dC9</p>
      </div>
      <div className="lotteryHeader">
        <div className="ui medium header">Lottery Wallet</div>
        <p>{lotteryWallet}</p>
      </div>
      <div className="contractHeader">
        <div className="ui medium header">Contract Address</div>
        <p>{lotteryAddress}</p>
      </div>
      <div className="winnerHeader">
        <div className="ui medium header">Previous Winners</div>
        {previousWinners.length ? (
          returnPreviousWinners
        ) : (
          <p>No previous winners</p>
        )}
      </div>
      <p className="ghFooter">
        <a href="https://github.com/dante-robinson/Crypto-Lottery">
          Check out the source code on Github
        </a>
        <i className="ghIcon github icon"></i>
      </p>
    </div>
  );
};

export default Main;
