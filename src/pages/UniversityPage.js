import React from "react";
import {
  Table1,
  LI1,
  Container4,
  TH1,
  List1,
  TD1,
  TitleText1,
  Link1,
  Row4,
  Row2Col_50,
  Image,
  Link2,
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
    <Container4>
      <TitleText1>
        <FaUniversity />
        {"\u00A0 "} University
      </TitleText1>
      <Table1>
        <tr>
          <TH1>- Geral -</TH1>
          <TH1>- Outros -</TH1>
        </tr>
        <tr>
          <TD1>
            <Link1
              href={"https://mail.google.com/mail/u/1/#inbox"}
              target="_blank"
            >
              <SiGmail /> {"\u00A0 "}FCT Email
            </Link1>
          </TD1>
          <TD1>
            <Link1 href={"https://www.fct.unl.pt"} target="_blank">
              <FaUniversity /> {"\u00A0 "}Nova FCT
            </Link1>
          </TD1>
        </tr>
        <tr>
          <TD1>
            <Link1
              href={"https://clip.fct.unl.pt/utente/eu/aluno?aluno=103867"}
              target="_blank"
            >
              <FiPaperclip /> {"\u00A0 "}Clip
            </Link1>
          </TD1>
          <TD1>
            <Link1 href={require("./assets/calendario.pdf")} target="_blank">
              <FaRegCalendarAlt /> {"\u00A0 "}Calendário
            </Link1>
          </TD1>
        </tr>
        <tr>
          <TD1>
            <Link1 href={"https://moodle.fct.unl.pt"} target="_blank">
              <FaMediumM /> {"\u00A0 "}Moodle
            </Link1>
          </TD1>
          <TD1>
            <Link1 href={"https://github.com"} target="_blank">
              <BsGithub /> {"\u00A0 "}Github
            </Link1>
          </TD1>
        </tr>
        <tr>
          <TD1>
            <Link1
              href={"https://drive.google.com/drive/u/1/starred"}
              target="_blank"
            >
              <FaGoogleDrive /> {"\u00A0 "}Google Drive
            </Link1>
          </TD1>
        </tr>
      </Table1>
      <br />
      <br />
      <Row4>
        <Row2Col_50>
          <List1>
            <GiBookshelf /> Disciplinas:
            <LI1>
              <Link2
                href={
                  "https://msprrtab.atlassian.net/jira/software/projects/RRTAB/boards/1/roadmap"
                }
                target="_blank"
              >
                Jira MSP
              </Link2>
            </LI1>
            {/* <LI1>Tea</LI1>
            <LI1>Milk</LI1> */}
          </List1>
        </Row2Col_50>
        <Row2Col_50>
          <Image
            src={require("./assets/horario.png")}
            width="518"
            height="288"
          />
        </Row2Col_50>
      </Row4>
    </Container4>
  );
};

export default UniversityPage;
