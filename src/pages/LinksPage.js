import React from "react";
import { Table1, Container5, TD2, Link1, TitleText1, TH2 } from "./styles";
import { AiOutlineCalendar, AiOutlineStock } from "react-icons/ai";
import { FiLink2 } from "react-icons/fi";
import { FaTv, FaCarAlt } from "react-icons/fa";
import { TiWeatherCloudy } from "react-icons/ti";
import { GiCanoe } from "react-icons/gi";
import { BiCalendarEvent } from "react-icons/bi";
import { BsFillKeyFill, BsYoutube } from "react-icons/bs";

const LinksPage = () => {
  return (
    <Container5>
      <TitleText1>
        <FiLink2 />
        {"\u00A0 "} Links
      </TitleText1>
      <Table1 style={{ borderLeft: "6px solid #b3001b" }}>
        <tr>
          <TH2>
            <TD2>
              <Link1 href={"https://pobre.tv"} target="_blank">
                <FaTv /> {"\u00A0 "}Pobre TV
              </Link1>
            </TD2>
          </TH2>
          <TH2>
            <TD2>
              <Link1 href={"https://www.youtube.com"} target="_blank">
                <BsYoutube /> {"\u00A0 "}Youtube
              </Link1>
            </TD2>
          </TH2>
          <TH2>
            <TD2>
              <Link1 href={"https://www.windguru.cz/222544"} target="_blank">
                <TiWeatherCloudy /> {"\u00A0 "}Weather
              </Link1>
            </TD2>
          </TH2>
        </tr>
      </Table1>
      <br />
      <br />
      <br />
      <Table1>
        <tr>
          <TD2>
            <Link1 href={"https://www.fpcanoagem.pt"} target="_blank">
              <GiCanoe /> {"\u00A0 "}FPCanoagem
            </Link1>
          </TD2>
          <TD2>
            <Link1 href={"F1 stream"} target="_blank">
              <FaCarAlt /> {"\u00A0 "}F1 stream
            </Link1>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Link1
              href={"https://www.formula1.com/en/racing/2022.html"}
              target="_blank"
            >
              <AiOutlineCalendar /> {"\u00A0 "}F1 calendar
            </Link1>
          </TD2>
          <TD2>
            <Link1 href={"https://pvpoke.com"} target="_blank">
              <AiOutlineStock /> {"\u00A0 "}PvPoke
            </Link1>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Link1 href={"https://leekduck.com/events/"} target="_blank">
              <BiCalendarEvent /> {"\u00A0 "}PokeGo events
            </Link1>
          </TD2>
          <TD2>
            <Link1 href={"https://csgostash.com"} target="_blank">
              <BsFillKeyFill /> {"\u00A0 "}CSGO Stach
            </Link1>
          </TD2>
        </tr>
      </Table1>
    </Container5>
  );
};

export default LinksPage;
