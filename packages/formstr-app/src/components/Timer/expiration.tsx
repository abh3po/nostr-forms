
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import moment from "moment";
import { Typography } from "antd";

const { Text } = Typography;

interface TimerProps {
  Expiration: string | undefined;
}

const calculateTimeRemaining = (Expiration: string) => {
  if (!Expiration) return null;
  const expirationDate = dayjs.unix(Number(Expiration));
  return expirationDate.diff(dayjs(), "milliseconds");
};

const Timer: React.FC<TimerProps> = ({ Expiration }) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!Expiration) return;

    const updateTimeRemaining = () => {
      const remaining = calculateTimeRemaining(Expiration);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining(); 

    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [Expiration]);

  const isConcluded = timeRemaining !== null && timeRemaining <= 0;

  const renderExpirationMessage = () => {
    if (isConcluded) {
      return `Poll concluded at: ${moment
        .unix(Number(Expiration))
        .format("YYYY-MM-DD HH:mm")}`;
    }

    if (timeRemaining !== null) {
      const isLessThan100Hours = timeRemaining < 100 * 60 * 60 * 1000;

      if (isLessThan100Hours) {
        const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutesLeft = Math.floor(
          (timeRemaining % (1000 * 60 * 60)) / (1000 * 60)
        );
        const secondsLeft = Math.floor((timeRemaining % (1000 * 60)) / 1000);
        return `Expires in: ${hoursLeft} hours, ${minutesLeft} minutes, and ${secondsLeft} seconds`;
      } else {
        const daysLeft = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        return `${daysLeft} days left to end`;
      }
    }

    return null;
  };

  return <Text>{renderExpirationMessage()}</Text>;
};

export default Timer;