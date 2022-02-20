import React, { useState, useEffect } from "react";
import env from "react-dotenv";
import axios from "axios";

const PreviousWinners = ({ lottery }) => {
  //Set value in advance to avoid error when mapping over array
  const [previousWinners, setPreviousWinners] = useState([]);

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
    getPreviousWinners();
  }, []);

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
    <div className="row-start-10 row-end-11 col-start-1 col-end-4">
      <h3 className="text-4xl font-extrabold">Previous Winners</h3>
      {previousWinners.length ? (
        returnPreviousWinners
      ) : (
        <p className="noWinner">No previous winners</p>
      )}
    </div>
  );
};

export default PreviousWinners;
