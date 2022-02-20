import React, { useState, useEffect } from "react";

const LotteryWallet = ({ lottery }) => {
  //Only Dynamic incase re-deployed
  const [lotteryWallet, setLotteryWallet] = useState(null);

  const getLotteryWallet = async (wallet) => {
    wallet = await lottery.methods.poolOwner().call();
    return setLotteryWallet(wallet);
  };

  useEffect(() => {
    getLotteryWallet();
  }, []);

  return (
    <div className="row-start-4 col-start-2 self-center text-center">
      <h3 className="text-4xl font-extrabold">Lottery Wallet</h3>
      <p className="text-xl relative top-5">{lotteryWallet}</p>
    </div>
  );
};

export default LotteryWallet;
