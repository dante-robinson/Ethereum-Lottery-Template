import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { MetaMaskProvider } from "metamask-react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HowItWorks from "./routes/HowItWorks";

ReactDOM.render(
  <BrowserRouter>
    <MetaMaskProvider>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="HowItWorks" element={<HowItWorks />} />
      </Routes>
    </MetaMaskProvider>
  </BrowserRouter>,
  document.getElementById("root")
);
