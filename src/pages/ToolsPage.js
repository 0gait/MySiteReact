import React from "react";
import { Table1, Container5, TD2, Links2, TitleText1 } from "./styles";
import { AiOutlineTool, AiFillRobot } from "react-icons/ai";
import { FaFile, FaIcons } from "react-icons/fa";
import { TfiWrite } from "react-icons/tfi";
import { IoIosColorPalette } from "react-icons/io";
import { BiTransfer, BiTimer } from "react-icons/bi";
import { BsCode, BsInputCursorText } from "react-icons/bs";

const ToolsPage = () => {
  return (
    <Container5>
      <TitleText1>
        <AiOutlineTool />
        {"\u00A0 "} Tools
      </TitleText1>
      <Table1>
        <tr>
          <TD2>
            <Links2 href={"https://tinywow.com"} target="_blank">
              <FaFile /> {"\u00A0 "}Tinywow
            </Links2>
          </TD2>
          <TD2>
            <Links2
              href={"https://www.w3schools.com/html/default.asp"}
              target="_blank"
            >
              <TfiWrite /> {"\u00A0 "}Tutoriais W3
            </Links2>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Links2 href={"http://colormind.io/bootstrap/"} target="_blank">
              <IoIosColorPalette /> {"\u00A0 "}Color generator
            </Links2>
          </TD2>
          <TD2>
            <Links2 href={"https://chat.openai.com/chat"} target="_blank">
              <AiFillRobot /> {"\u00A0 "}IA Bot
            </Links2>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Links2 href={"https://www.deepl.com/translator"} target="_blank">
              <BiTransfer /> {"\u00A0 "}Tradutor
            </Links2>
          </TD2>
          <TD2>
            <Links2
              href={
                "https://leetcode.com/problem-list/challenges-for-new-users/"
              }
              target="_blank"
            >
              <BsCode /> {"\u00A0 "}Leet Code
            </Links2>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Links2 href={"https://10minutemail.com"} target="_blank">
              <BiTimer /> {"\u00A0 "}Temporary email
            </Links2>
          </TD2>
          <TD2>
            <Links2
              href={
                "https://www.flip.pt/FLiP-On-line/Corrector-ortografico-e-sintactico"
              }
              target="_blank"
            >
              <BsInputCursorText /> {"\u00A0 "}Corretor ortográfico
            </Links2>
          </TD2>
        </tr>
        <tr>
          <TD2>
            <Links2 href={"https://icons8.com"} target="_blank">
              <FaIcons /> {"\u00A0 "}Icons for apps
            </Links2>
          </TD2>
        </tr>
        <tr></tr>
      </Table1>
    </Container5>
  );
};

export default ToolsPage;
