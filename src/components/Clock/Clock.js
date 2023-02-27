import React, { useState, useEffect } from "react";
import { Container, Hr, Text, Text2, Text3, Text4, Text5 } from "./styles";

const Clock = () => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const intervalID = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(intervalID);
    };
  }, []);

  const getHour = (hour) => {
    if (hour < 10) return "0" + hour;
    else return hour;
  };

  const getMin = (min) => {
    if (min < 10) return "0" + min;
    else return min;
  };

  const getSec = (sec) => {
    if (sec < 10) return "0" + sec;
    else return sec;
  };

  const h = getHour(time.getHours());
  const m = getMin(time.getMinutes());
  const s = getSec(time.getSeconds());
  let date = new Date();
  const d = `${days[date.getDay()]}, ${
    months[date.getMonth()]
  } ${date.getDate()}, ${date.getFullYear()}`;

  return (
    <Container>
      <Text>
        <Text3 id="date">{d}</Text3>
        <Hr />
        <Text2>
          <Text4 id="hours">{h}:</Text4>
          <Text4 id="minutes">{m}:</Text4>
          <Text5 id="seconds">{s}</Text5>
        </Text2>
      </Text>
    </Container>
  );
};

export default Clock;
