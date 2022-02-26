import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { injected } from "./Metamask";

const Button = () => {
  const { active, account, library, connector, activate } = useWeb3React();

  const [accountBalance, setAccountBalance] = useState(null);

  async function connect() {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  }

  const buttonUI = () => {
    if (!active) {
      return (
        <button
          onClick={connect}
          className="py-2 px-3 bg-blue-500 hover:bg-blue-700 rounded-lg"
        >
          {buttonText()}
        </button>
      );
    } else if (active) {
      return (
        <div className="pl-1 bg-blue-300 rounded-xl">
          {accountBalance}
          <button className="py-2 px-3 bg-blue-500 hover:bg-blue-700 rounded-xl">
            {buttonText()}
          </button>
        </div>
      );
    }
  };

  const getBalance = async () => {
    if (active) {
      let balance = await library.eth.getBalance(account);
      balance /= 1000000000000000000;
      balance = balance.toString().slice(0, 6) + " ETH ";
      setAccountBalance(balance);
    }
  };

  useEffect(() => {
    getBalance();
  }, [active]);

  const buttonText = () => {
    if (!active) {
      return <p>Connect to MetaMask</p>;
    } else if (active) {
      let address = account;
      //Removes the string portion between letters 7 and 38
      address = address.slice(0, 6) + "..." + address.slice(38, address.length);
      return <p>{address}</p>;
    }
  };

  return <div>{buttonUI()}</div>;
};

export default Button;
