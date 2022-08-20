import React from "react";

export const Timer = () => {
  const [counter, setCounter] = React.useState(3);

  React.useEffect(() => {
    const timer =
      counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
    return () => clearInterval(timer);
  }, [counter]);
  return <div id="timer">{counter}</div>;
};