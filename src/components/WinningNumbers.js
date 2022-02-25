import React, { useState, useEffect } from "react";

const WinningNumbers = ({ lottery }) => {
  const [pastNumbers, setWinningNumbers] = useState([]);

  const getWinningNumbers = async () => {
    let numbers = [];
    let draw = await lottery.methods.drawNumber().call();
    for (let i = 0; i < 7; i++) {
      numbers[i] = `${await lottery.methods.winningNumbers(draw, i).call()}`;
    }
    setWinningNumbers((pastNumbers) => numbers);
  };

  useEffect(() => {
    getWinningNumbers();
  }, []);

  const returnPastNumbers = pastNumbers.slice(0, 7).map((number, index) => {
    return (
      <li className="list-none inline text-2xl relative top-5" key={index}>
        {number}{" "}
      </li>
    );
  });

  return (
    <div className="row-start-3 col-start-3 self-center text-center">
      <h3 className="text-4xl font-extrabold">Previous winning numbers</h3>
      <p>{returnPastNumbers}</p>
    </div>
  );
};

export default WinningNumbers;
