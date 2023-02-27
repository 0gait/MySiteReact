import React from "react";
import { Table1, Container, Td, Links, TitleText } from "./styles";
import { AiOutlineCalendar, AiOutlineStock } from "react-icons/ai";
import { FiLink2 } from "react-icons/fi";
import { FaTv, FaCarAlt } from "react-icons/fa";
import { TiWeatherCloudy } from "react-icons/ti";
import { GiCanoe } from "react-icons/gi";
import { BiCalendarEvent } from "react-icons/bi";
import { BsFillKeyFill, BsYoutube } from "react-icons/bs";

const LinksPage = () => {
  return (
    <Container>
      <TitleText>
        <FiLink2 />
        {"\u00A0 "} Links
      </TitleText>
      <Table1>
        <tr>
          <Td>
            <Links href={"https://pobre.tv"} target="_blank">
              <FaTv /> {"\u00A0 "}Pobre TV
            </Links>
          </Td>
          <Td>
            <Links href={"https://www.windguru.cz/222544"} target="_blank">
              <TiWeatherCloudy /> {"\u00A0 "}Weather
            </Links>
          </Td>
        </tr>
        <tr>
          <Td>
            <Links href={"https://www.fpcanoagem.pt"} target="_blank">
              <GiCanoe /> {"\u00A0 "}FPCanoagem
            </Links>
          </Td>
          <Td>
            <Links href={"F1 stream"} target="_blank">
              <FaCarAlt /> {"\u00A0 "}F1 stream
            </Links>
          </Td>
        </tr>
        <tr>
          <Td>
            <Links
              href={"https://www.formula1.com/en/racing/2022.html"}
              target="_blank"
            >
              <AiOutlineCalendar /> {"\u00A0 "}F1 calendar
            </Links>
          </Td>
          <Td>
            <Links href={"https://pvpoke.com"} target="_blank">
              <AiOutlineStock /> {"\u00A0 "}PvPoke
            </Links>
          </Td>
        </tr>
        <tr>
          <Td>
            <Links href={"https://leekduck.com/events/"} target="_blank">
              <BiCalendarEvent /> {"\u00A0 "}PokeGo events
            </Links>
          </Td>
          <Td>
            <Links href={"https://csgostash.com"} target="_blank">
              <BsFillKeyFill /> {"\u00A0 "}CSGO Stach
            </Links>
          </Td>
        </tr>
        <tr>
          {" "}
          <Td>
            <Links href={"https://www.youtube.com"} target="_blank">
              <BsYoutube /> {"\u00A0 "}Youtube
            </Links>
          </Td>
        </tr>
      </Table1>
    </Container>
  );
};

export default LinksPage;
