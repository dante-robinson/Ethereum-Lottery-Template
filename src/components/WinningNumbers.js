import React, { useState, useEffect } from "react";

const WinningNumbers = ({ lottery }) => {
  const [currentDraw, setCurrentDraw] = useState(null);
  const [pastNumbers, setWinningNumbers] = useState([]);

  const getWinningNumbers = async () => {
    let numbers = [];
    let draw = await lottery.methods.drawNumber().call();
    setCurrentDraw(draw);

    for (let i = 0; i < 7; i++) {
      numbers[i] = await lottery.methods.winningNumbers(draw, i).call();
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

  const returnNoNumbers = () => {
    if (pastNumbers[0] == 0) {
      return (
        <p className="text-2xl relative top-5">There hasn't been a draw yet</p>
      );
    } else if (currentDraw === null) {
      return <p className="text-2xl relative top-5">Loading...</p>;
    }
  };

  return (
    <div className="row-start-3 col-start-3 self-center text-center">
      <h3 className="text-4xl font-extrabold">Previous Winning Numbers</h3>
      {pastNumbers.length === 7 && pastNumbers[0] != 0 ? (
        <p>{returnPastNumbers}</p>
      ) : (
        <div>{returnNoNumbers()}</div>
      )}
    </div>
  );
};

export default WinningNumbers;
