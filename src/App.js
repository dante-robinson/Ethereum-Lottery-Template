import React from "react";
import ContractAddress from "./components/ContractAddress";
import CurrentPrizePool from "./components/CurrentPrizePool";
import DeveloperWallet from "./components/DeveloperWallet";
import Footer from "./components/Footer";
import LotteryWallet from "./components/LotteryWallet";
import Header from "./components/Header";
import TimeTillDraw from "./components/TimeTillDraw";
import WinningNumbers from "./components/WinningNumbers";

const App = (props) => {
  return (
    <div className="min-h-screen p-4 grid grid-cols-3 gap-4 grid-rows-home">
      <Header />
      <CurrentPrizePool lottery={props.lottery} />
      <TimeTillDraw lottery={props.lottery} />
      <WinningNumbers lottery={props.lottery} />
      <DeveloperWallet />
      <LotteryWallet lottery={props.lottery} />
      <ContractAddress lottery={props.lottery} />
      <Footer />
    </div>
  );
};

export default App;
