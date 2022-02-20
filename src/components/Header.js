import React from "react";
import Metamask from "../metamask.png";

const MenuBar = () => {
  return (
    <nav className="col-span-3 max-h-14">
      <div className="flex justify-between">
        <div>
          <span className="text-5xl font-extrabold">Crypto Lottery</span>
        </div>

        <div className="flex justify-center space-x-8">
          <h2 className="text-2xl font-bold self-center">How It Works</h2>
          <a className="text-2xl font-bold self-center">Previous Winners</a>
          <a className="text-2xl font-bold self-center">Account</a>
        </div>
        <div className="justify-self-end self-center">
          <button className="py-2 px-3 bg-blue-500 hover:bg-blue-700 rounded-lg">
            Login with Metamask
          </button>
        </div>
      </div>
    </nav>
  );
};

export default MenuBar;
