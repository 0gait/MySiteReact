import React, { useEffect } from "react";
import { SDContainer1 } from "./styles";
import DiagramEditor from "../components/DiagramEditor/DiagramEditor";

const DiagramMakerPage = () => {
  useEffect(() => {}, []);

  return (
    <SDContainer1>
      <DiagramEditor />
    </SDContainer1>
  );
};

export default DiagramMakerPage;
