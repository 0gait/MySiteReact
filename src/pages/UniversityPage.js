import React from "react";
import {
  SUPTable1,
  SUPli,
  SUPContainer,
  SUPthVertical,
  SUPList,
  SUPtd,
  SUPTitleText,
  SUPaTag,
  SUPRow2,
  SUPRow2Col1,
  SUPRow2Col2,
} from "./styles";
import { FiPaperclip } from "react-icons/fi";
import { SiGmail } from "react-icons/si";
import { GiBookshelf } from "react-icons/gi";
import {
  FaMediumM,
  FaUniversity,
  FaRegCalendarAlt,
  FaGoogleDrive,
} from "react-icons/fa";
import { BsGithub } from "react-icons/bs";

const UniversityPage = () => {
  return (
    <SUPContainer>
      <SUPTitleText>
        <FaUniversity />
        {"\u00A0 "} University
      </SUPTitleText>
      <SUPTable1>
        <tr>
          <SUPthVertical>- Geral -</SUPthVertical>
          <SUPthVertical>- Outros -</SUPthVertical>
        </tr>
        <tr>
          <SUPtd>
            <SUPaTag
              href={"https://mail.google.com/mail/u/1/#inbox"}
              target="_blank"
            >
              <SiGmail /> {"\u00A0 "}Email
            </SUPaTag>
          </SUPtd>
          <SUPtd>
            <SUPaTag href={"https://www.fct.unl.pt"} target="_blank">
              <FaUniversity /> {"\u00A0 "}Nova FCT
            </SUPaTag>
          </SUPtd>
        </tr>
        <tr>
          <SUPtd>
            <SUPaTag
              href={"https://clip.fct.unl.pt/utente/eu/aluno?aluno=103867"}
              target="_blank"
            >
              <FiPaperclip /> {"\u00A0 "}Clip
            </SUPaTag>
          </SUPtd>
          <SUPtd>
            <SUPaTag href={require("./assets/calendario.pdf")} target="_blank">
              <FaRegCalendarAlt /> {"\u00A0 "}Calendário
            </SUPaTag>
          </SUPtd>
        </tr>
        <tr>
          <SUPtd>
            <SUPaTag href={"https://moodle.fct.unl.pt"} target="_blank">
              <FaMediumM /> {"\u00A0 "}Moodle
            </SUPaTag>
          </SUPtd>
          <SUPtd>
            <SUPaTag href={"https://github.com"} target="_blank">
              <BsGithub /> {"\u00A0 "}Github
            </SUPaTag>
          </SUPtd>
        </tr>
        <tr>
          <SUPtd>
            <SUPaTag
              href={"https://drive.google.com/drive/u/1/starred"}
              target="_blank"
            >
              <FaGoogleDrive /> {"\u00A0 "}Google Drive
            </SUPaTag>
          </SUPtd>
        </tr>
      </SUPTable1>
      <br />
      <br />
      <br />
      <SUPRow2>
        <SUPRow2Col1>
          <SUPList>
            <GiBookshelf /> Disciplinas:
            {/* <SUPli>Coffee</SUPli>
        <SUPli>Tea</SUPli>
        <SUPli>Milk</SUPli> */}
          </SUPList>
        </SUPRow2Col1>
        <SUPRow2Col2>
          <img src={require("./assets/horario.png")} width="510" height="280" />
        </SUPRow2Col2>
      </SUPRow2>
    </SUPContainer>
  );
};

export default UniversityPage;
