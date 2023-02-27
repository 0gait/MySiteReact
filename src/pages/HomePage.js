import React, { useEffect } from "react";
import {
  SHPContainer1,
  SHPRow1,
  SHPRow2,
  SHPRow2Col1,
  SHPRow2Col2,
} from "./styles";
import Weather from "../components/Weather/Weather";
import Clock from "../components/Clock/Clock";

const HomePage = () => {
  useEffect(() => {}, []);

  return (
    <SHPContainer1>
      <SHPRow1>
        <Clock />
      </SHPRow1>
      <SHPRow2>
        <SHPRow2Col1>
          <Weather />
        </SHPRow2Col1>
        <SHPRow2Col2>
          <iframe
            title="calendar"
            src="https://bauermedia.pt/cidade/emissaofm"
            height="300px"
            width="350px"
            frameborder="0"
          ></iframe>
        </SHPRow2Col2>
      </SHPRow2>
    </SHPContainer1>
  );
};

export default HomePage;
