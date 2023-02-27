import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LinksPage from "./pages/LinksPage";
import NotesPage from "./pages/NotesPage";
import ToolsPage from "./pages/ToolsPage";
import UniversityPage from "./pages/UniversityPage";
import DiagramMakerPage from "./pages/DiagramMakerPage";

const Switches = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/linksPage" element={<LinksPage />} />
      <Route path="/notesPage" element={<NotesPage />} />
      <Route path="/toolsPage" element={<ToolsPage />} />
      <Route path="/universityPage" element={<UniversityPage />} />
      <Route path="/diagramMakerPage" element={<DiagramMakerPage />} />
    </Routes>
  );
};

export default Switches;
