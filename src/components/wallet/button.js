import React, { useCallback, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { injected } from "./metamask";

const Button = () => {
  const { active, account, library, connector, activate, deactivate } =
    useWeb3React();
  const web3React = useWeb3React();

  async function connect() {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  }

  async function disconnect() {
    try {
      deactivate();
    } catch (ex) {
      console.log(ex);
    }
  }

  return (
    <button
      onClick={connect}
      className="py-2 px-3 bg-blue-500 hover:bg-blue-700 rounded-lg"
    >
      Connect to MetaMask
    </button>
  );
};

export default Button;
