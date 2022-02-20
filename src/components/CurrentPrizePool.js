import React, { useState, useEffect } from "react";

const CurrentPrizePool = ({ lottery }) => {
  const [totalPrizePool, setTotalPrizePool] = useState(null);

  const getTotalPrizePool = async (total) => {
    total = await lottery.methods.totalPrizePool().call();
    return setTotalPrizePool(total);
  };

  useEffect(() => {
    getTotalPrizePool();
  }, []);

  return (
    <div className="row-start-2 col-start-3 self-center text-center">
      <h3 className="text-4xl font-extrabold">Current Prize Pool</h3>
      <p className="text-2xl relative top-5">{totalPrizePool}</p>
    </div>
  );
};

export default CurrentPrizePool;
