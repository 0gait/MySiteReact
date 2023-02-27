import React from "react";
import { Table1, Container, Td, Links, TitleText } from "./styles";
import { AiOutlineTool, AiFillRobot } from "react-icons/ai";
import { FaFile } from "react-icons/fa";
import { TfiWrite } from "react-icons/tfi";
import { IoIosColorPalette } from "react-icons/io";
import { BiTransfer, BiTimer } from "react-icons/bi";
import { BsCode, BsInputCursorText } from "react-icons/bs";

const ToolsPage = () => {
  return (
    <Container>
      <TitleText>
        <AiOutlineTool />
        {"\u00A0 "} Tools
      </TitleText>
      <Table1>
        <tr>
          <Td>
            <Links href={"https://tinywow.com"} target="_blank">
              <FaFile /> {"\u00A0 "}Tinywow
            </Links>
          </Td>
          <Td>
            <Links
              href={"https://www.w3schools.com/html/default.asp"}
              target="_blank"
            >
              <TfiWrite /> {"\u00A0 "}Tutoriais W3
            </Links>
          </Td>
        </tr>
        <tr>
          <Td>
            <Links href={"http://colormind.io/bootstrap/"} target="_blank">
              <IoIosColorPalette /> {"\u00A0 "}Color generator
            </Links>
          </Td>
          <Td>
            <Links href={"https://chat.openai.com/chat"} target="_blank">
              <AiFillRobot /> {"\u00A0 "}IA Bot
            </Links>
          </Td>
        </tr>
        <tr>
          <Td>
            <Links href={"https://www.deepl.com/translator"} target="_blank">
              <BiTransfer /> {"\u00A0 "}Tradutor
            </Links>
          </Td>
          <Td>
            <Links
              href={
                "https://leetcode.com/problem-list/challenges-for-new-users/"
              }
              target="_blank"
            >
              <BsCode /> {"\u00A0 "}Leet Code
            </Links>
          </Td>
        </tr>
        <tr>
          <Td>
            <Links href={"https://10minutemail.com"} target="_blank">
              <BiTimer /> {"\u00A0 "}Temporary email
            </Links>
          </Td>
          <Td>
            <Links
              href={
                "https://www.flip.pt/FLiP-On-line/Corrector-ortografico-e-sintactico"
              }
              target="_blank"
            >
              <BsInputCursorText /> {"\u00A0 "}Corretor ortográfico
            </Links>
          </Td>
        </tr>
        <tr></tr>
      </Table1>
    </Container>
  );
};

export default ToolsPage;
