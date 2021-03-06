import React from "react";
import ReactDOM from "react-dom";
import Lottery from "./artifacts/Lottery.json";
import App from "./routes/App";
import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Web3 from "web3";
import { Web3ReactProvider } from "@web3-react/core";
import HowItWorks from "./routes/HowItWorks";
import PreviousWinners from "./routes/PreviousWinners";
import Account from "./routes/Account";

function getLibrary(provider, connector) {
  return new Web3(provider);
}

const web3 = new Web3(
  window.ethereum
    ? window.ethereum
    : "https://eth-rinkeby.alchemyapi.io/v2/" +
      process.env.REACT_APP_ALCHEMY_API
);
const LotteryAddress = "0x42E82fa85E3A34d5DAA0ea14f203096c74b9021D";
const lottery = new web3.eth.Contract(Lottery.abi, LotteryAddress, {
  data: Lottery.DeployedBytecode,
});

ReactDOM.render(
  <BrowserRouter>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Routes>
        <Route path="/" element={<App lottery={lottery} />} />
        <Route path="HowItWorks" element={<HowItWorks />} />
        <Route
          path="Previous-Winners"
          element={<PreviousWinners lottery={lottery} />}
        />
        <Route path="Account" element={<Account lottery={lottery} />} />
      </Routes>
    </Web3ReactProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
