import React from "react";
import { Table1, Container5, TD2, Links2, TitleText1 } from "./styles";
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
      <Table1>
        <tr>
          <TD2>
            <Links2 href={"https://pobre.tv"} target="_blank">
              <FaTv /> {"\u00A0 "}Pobre TV
            </Links2>
          </TD2>
          <TD2>
            <Links2 href={"https://www.windguru.cz/222544"} target="_blank">
              <TiWeatherCloudy /> {"\u00A0 "}Weather
            </Links2>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Links2 href={"https://www.fpcanoagem.pt"} target="_blank">
              <GiCanoe /> {"\u00A0 "}FPCanoagem
            </Links2>
          </TD2>
          <TD2>
            <Links2 href={"F1 stream"} target="_blank">
              <FaCarAlt /> {"\u00A0 "}F1 stream
            </Links2>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Links2
              href={"https://www.formula1.com/en/racing/2022.html"}
              target="_blank"
            >
              <AiOutlineCalendar /> {"\u00A0 "}F1 calendar
            </Links2>
          </TD2>
          <TD2>
            <Links2 href={"https://pvpoke.com"} target="_blank">
              <AiOutlineStock /> {"\u00A0 "}PvPoke
            </Links2>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Links2 href={"https://leekduck.com/events/"} target="_blank">
              <BiCalendarEvent /> {"\u00A0 "}PokeGo events
            </Links2>
          </TD2>
          <TD2>
            <Links2 href={"https://csgostash.com"} target="_blank">
              <BsFillKeyFill /> {"\u00A0 "}CSGO Stach
            </Links2>
          </TD2>
        </tr>
        <tr>
          {" "}
          <TD2>
            <Links2 href={"https://www.youtube.com"} target="_blank">
              <BsYoutube /> {"\u00A0 "}Youtube
            </Links2>
          </TD2>
        </tr>
      </Table1>
    </Container5>
  );
};

export default LinksPage;
