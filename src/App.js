import React from "react";
import Lottery from "./artifacts/Lottery.json";
import ContractAddress from "./components/ContractAddress";
import CurrentPrizePool from "./components/CurrentPrizePool";
import DeveloperWallet from "./components/DeveloperWallet";
import Footer from "./components/Footer";
import LotteryWallet from "./components/LotteryWallet";
import Header from "./components/Header";
import PreviousWinners from "./components/PreviousWinners";
import TimeTillDraw from "./components/TimeTillDraw";
import WinningNumbers from "./components/WinningNumbers";
import { useMetaMask } from "metamask-react";
import { Outlet } from "react-router-dom";
import Web3 from "web3";

const web3 = new Web3(window.ethereum);
const LotteryAddress = "0x42E82fa85E3A34d5DAA0ea14f203096c74b9021D";
const lottery = new web3.eth.Contract(Lottery.abi, LotteryAddress, {
  data: Lottery.DeployedBytecode,
});

const App = () => {
  const { status, connect, account, chainId, ethereum } = useMetaMask();

  return (
    <div className="min-h-screen p-4 grid grid-cols-3 gap-4 grid-rows-home">
      <Header />
      <CurrentPrizePool lottery={lottery} />
      <TimeTillDraw lottery={lottery} />
      <WinningNumbers lottery={lottery} />
      <DeveloperWallet />
      <LotteryWallet lottery={lottery} />
      <ContractAddress lottery={lottery} />
      <Footer />
      <Outlet />
    </div>
  );
};

export default App;
