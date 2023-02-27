import React, { useEffect } from "react";
import { SNPContainer1 } from "./styles";
import NotePadEditor from "../components/NotePad/NotePadEditor";

const NotesPage = () => {
  useEffect(() => {}, []);

  return (
    <SNPContainer1>
      <NotePadEditor />
    </SNPContainer1>
  );
};

export default NotesPage;
