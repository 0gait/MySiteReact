import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CircularGauge,
  Scale,
  RangeContainer,
  Range,
  Tooltip,
  Size,
  ValueIndicator,
} from "devextreme-react/circular-gauge";
import {
  SWBodyContainer,
  SWTitleContainer,
  SWTitleDiv1,
  SWTitleDiv2,
  SWContainer,
  SWText,
  SWBodyDiv1,
  SWBodyDiv2,
  SWText2,
  SWBodyDiv3,
  SWText3,
  SWContainer2,
} from "./styles";
import { BiCurrentLocation } from "react-icons/bi";
import { BsWind, BsSunrise, BsSunset } from "react-icons/bs";
import { GiWindsock } from "react-icons/gi";

const Weather = () => {
  const [weather, setWeather] = useState(false);
  const [location, setLocation] = useState(false);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      getWeather(position.coords.latitude, position.coords.longitude);
      setLocation(true);
    });
  }, []);

  const getWeather = async (lat, long) => {
    let res = await axios.get(
      "http://api.openweathermap.org/data/2.5/weather",
      {
        params: {
          lat: lat,
          lon: long,
          appid: process.env.REACT_APP_OPEN_WHEATHER_KEY,
          lang: "pt",
          units: "metric",
        },
      }
    );
    setWeather(res.data);
  };

  const getTimeFrom = (time) => {
    let date = new Date(time * 1000);
    return date.getHours() + "H " + date.getMinutes() + "min";
  };

  const getWindDirection = (graus) => {
    if (graus >= 345 && graus <= 15) return "N";
    else if (graus > 15 && graus < 75) return "NE";
    else if (graus >= 75 && graus <= 105) return "E";
    else if (graus > 105 && graus < 165) return "SE";
    else if (graus >= 165 && graus <= 195) return "S";
    else if (graus > 195 && graus < 255) return "SW";
    else if (graus >= 255 && graus <= 285) return "W";
    else if (graus > 285 && graus < 345) return "NW";
  };

  if (location === false) {
    return (
      <SWContainer2>
        É necessário ligar a localização no browser o/
      </SWContainer2>
    );
  } else if (weather === false) {
    return <SWContainer2>Carregando...</SWContainer2>;
  } else {
    return (
      <SWContainer>
        <SWTitleContainer>
          <SWTitleDiv1>
            <SWText>
              <BiCurrentLocation fontSize={25} color={"#b3001b"} /> {"\u00A0"}
              {weather["name"]} ({weather["weather"][0]["description"]})
            </SWText>
          </SWTitleDiv1>
          <SWTitleDiv2>
            <SWText3>
              Long: {weather["coord"]["lon"]}° {"\u00A0"} Lat:{" "}
              {weather["coord"]["lat"]}°
            </SWText3>
          </SWTitleDiv2>
        </SWTitleContainer>
        <SWBodyContainer>
          <SWBodyDiv1>
            <SWText2>
              <BsWind fontSize={25} color={"#0b4f6c"} />
              {"\u00A0 \u00A0"}{" "}
              {parseFloat(weather["wind"]["speed"] * 3.6).toFixed(1)} km/h
            </SWText2>
            <SWText2>
              <GiWindsock fontSize={25} color={"#0b4f6c"} />
              {"\u00A0 \u00A0"} {getWindDirection(weather["wind"]["deg"])}
            </SWText2>
          </SWBodyDiv1>
          <SWBodyDiv2>
            <CircularGauge
              id="gauge"
              value={weather["main"]["temp"]}
              subvalues={[
                weather["main"]["temp_min"],
                weather["main"]["temp_max"],
              ]}
            >
              <Scale startValue={-10} endValue={50} tickInterval={10} />
              <Size height={230} width={230} />
              <RangeContainer palette={"Soft Blue"}>
                <Range startValue={-10} endValue={10} color="#be03fc" />
                <Range startValue={10} endValue={18} color="#0388fc" />
                <Range startValue={18} endValue={28} color="#00bd10" />
                <Range startValue={28} endValue={35} color="#dade04" />
                <Range startValue={35} endValue={50} color="#fc2803" />
              </RangeContainer>
              <Tooltip enabled={true} />
              <ValueIndicator
                type={"rectangleNeedle"}
                width={4}
                color={"#0f0f0f"}
                spindleSize={10}
              />
            </CircularGauge>
          </SWBodyDiv2>
          <SWBodyDiv3>
            <SWText2>
              <BsSunrise fontSize={25} color={"#e16036"} />
              {"\u00A0 \u00A0"}
              {getTimeFrom(weather["sys"]["sunrise"])}
            </SWText2>
            <SWText2>
              <BsSunset fontSize={25} color={"#e16036"} />
              {"\u00A0 \u00A0"}
              {getTimeFrom(weather["sys"]["sunset"])}
            </SWText2>
          </SWBodyDiv3>
        </SWBodyContainer>
      </SWContainer>
    );
  }
};

export default Weather;
