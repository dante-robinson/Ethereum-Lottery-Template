import React, { useState, useEffect } from "react";

const TimeTillDraw = ({ lottery }) => {
  const [timeTillDraw, setTimeTillDraw] = useState({});
  const [nextDrawTime, setNextDrawTime] = useState(
    new Date("February 11, 2022 0:00:00")
  );

  const getTimeTillDraw = () => {
    let currentDate = new Date(Date.now());
    console.log(nextDrawTime);

    if (currentDate > nextDrawTime) {
      let day = nextDrawTime;
      day = day + 7;
      setNextDrawTime(nextDrawTime.setUTCDate(day));
      console.log(nextDrawTime);
    }

    const difference = nextDrawTime - currentDate;

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return setTimeTillDraw(timeLeft);
  };

  useEffect(() => {
    setTimeout(() => {
      getTimeTillDraw();
    }, 1000);
  }, [timeTillDraw]);

  return (
    <div className="row-span-2 col-span-2 self-center text-center">
      <h3 className="text-4xl font-extrabold">Time left until next draw</h3>
      <h5 className="text-2xl font-bold">Days | Hours | Minutes | Seconds </h5>
      <div className="space-x-12">
        <p className="text-xl inline relative right-11">{timeTillDraw.days}</p>
        <p className="text-xl inline relative right-8">{timeTillDraw.hours}</p>
        <p className="text-xl inline relative right-2">
          {timeTillDraw.minutes}
        </p>
        <p className="text-xl inline relative left-7">{timeTillDraw.seconds}</p>
      </div>
    </div>
  );
};

export default TimeTillDraw;
