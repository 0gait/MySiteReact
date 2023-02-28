import React, { useEffect } from "react";
import { Container2 } from "./styles";
import NotePadEditor from "../components/NotePad/NotePadEditor";

const NotesPage = () => {
  useEffect(() => {}, []);

  return (
    <Container2>
      <NotePadEditor />
    </Container2>
  );
};

export default NotesPage;
