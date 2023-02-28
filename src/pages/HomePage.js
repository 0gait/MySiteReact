import React from "react";
import {
  Container1,
  Row3,
  Layer1,
  Layer2,
  List1,
  LI2,
  Row2,
  Row2Col1,
  Row2Col2,
  Link1,
} from "./styles";
import Weather from "../components/Weather/Weather";
import Clock from "../components/Clock/Clock";
import { SiGmail } from "react-icons/si";
import PopUp1 from "../components/PopUp/PopUp";

const HomePage = () => {
  return (
    <Container1>
      <Row3>
        <Layer1>
          <List1>
            <LI2>
              <Link1
                href={"https://mail.google.com/mail/u/2/#inbox"}
                target="_blank"
              >
                <SiGmail />
              </Link1>
            </LI2>
            <LI2>
              <PopUp1 />
            </LI2>
          </List1>
        </Layer1>
        <Layer2>
          <Clock />
        </Layer2>
      </Row3>
      <Row2>
        <Row2Col1>
          <Weather />
        </Row2Col1>
        <Row2Col2>
          <iframe
            title="calendar"
            src="https://bauermedia.pt/cidade/emissaofm"
            height="300px"
            width="350px"
            frameborder="0"
          ></iframe>
        </Row2Col2>
      </Row2>
    </Container1>
  );
};

export default HomePage;
