import React, { useEffect } from "react";
import { Container3 } from "./styles";
import DiagramEditor from "../components/DiagramEditor/DiagramEditor";

const DiagramMakerPage = () => {
  useEffect(() => {}, []);

  return (
    <Container3>
      <DiagramEditor />
    </Container3>
  );
};

export default DiagramMakerPage;
