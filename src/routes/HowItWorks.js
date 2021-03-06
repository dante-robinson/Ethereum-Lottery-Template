import React from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";

const HowItWorks = () => {
  return (
    <div className=" min-h-screen p-4 grid grid-cols-3 gap-4 grid-rows-other">
      <Header />
      <h3 className="text-4xl font-extrabold col-start-2 row-start-3 text-center">
        How it works
      </h3>
      <p className="col-span-3 row-start-4 relative top-12 text-center">
        You the player can enter the lottery by choosing 7 numbers between 1 and
        50 and then will pay for the transaction fee as well as the cost of the
        lottery ticket (0.1 ETH). The money is sent to the designated lottery
        address where the ether is stored until the next draw. The contract will
        contact Chainlinks oracle to get 7 randomly generated numbers back. The
        player will then need to check the numbers they chose against the drawn
        winning numbers before the next draw (1 week) as the ticket will then be
        void (
        <b>
          Note that you will need to pay a transaction fee to check your numbers
        </b>
        ). You will not recieve a prize until the following draw however you are
        able to enter the next draw right after checking your numbers if you
        choose. Once the contract goes to get the next 7 random numbers for the
        next draw the following week the contract will also payout all the
        winners of the previous draw these transactions can be verified by
        checking the lottery address listed below.
      </p>
      <Footer />
    </div>
  );
};

export default HowItWorks;
