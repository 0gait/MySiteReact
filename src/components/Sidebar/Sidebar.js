import React, { useContext, useRef, useState } from "react";
import { ThemeContext } from "./../../App";
import { useLocation } from "react-router-dom";
import { logoSVG } from "../../assets";
import {
  SContainer1,
  SDivider,
  SLink,
  SLinkContainer,
  SLinkIcon,
  SLinkLabel,
  SLogo,
  SSearch,
  SSearchIcon,
  SSidebar,
  STheme,
  SThemeLabel,
  SThemeToggler,
  SToggleThumb,
  STitle,
  SForm,
} from "./styles";

import { AiOutlineHome, AiOutlineSearch, AiOutlineTool } from "react-icons/ai";
import { FiLink2 } from "react-icons/fi";
import { BsDiagram2 } from "react-icons/bs";
import { BiNotepad } from "react-icons/bi";
import { FaUniversity } from "react-icons/fa";

const Sidebar = () => {
  const searchRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const { setTheme, theme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { pathname } = useLocation();

  const searchClickHandler = () => {
    if (!sidebarOpen) {
      setSidebarOpen(true);
      searchRef.current.focus();
    }
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noreferrer");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    openInNewTab(`https://www.google.com/search?q=${searchValue}`);
  };

  return (
    <SSidebar isOpen={sidebarOpen}>
      <SLogo>
        <SContainer1>
          <img src={logoSVG} alt="logo" />
          {sidebarOpen && <STitle> Things </STitle>}
        </SContainer1>
      </SLogo>
      <SSearch
        onClick={searchClickHandler}
        style={!sidebarOpen ? { width: `fit-content` } : {}}
      >
        <SSearchIcon>
          <AiOutlineSearch />
        </SSearchIcon>
        <SForm onSubmit={handleSubmit}>
          <input
            placeholder="Search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            style={!sidebarOpen ? { width: 0, padding: 0 } : {}}
          />
        </SForm>
      </SSearch>
      <SDivider />
      {linksArray.map(({ icon, label, to }) => (
        <SLinkContainer key={label} isActive={pathname === to}>
          <SLink to={to} style={!sidebarOpen ? { width: `fit-content` } : {}}>
            <SLinkIcon>{icon}</SLinkIcon>
            {sidebarOpen && (
              <>
                <SLinkLabel>{label}</SLinkLabel>
              </>
            )}
          </SLink>
        </SLinkContainer>
      ))}
      <SDivider />
      {secondaryLinksArray.map(({ icon, label, to }) => (
        <SLinkContainer key={label} isActive={pathname === to}>
          <SLink to={to} style={!sidebarOpen ? { width: `fit-content` } : {}}>
            <SLinkIcon>{icon}</SLinkIcon>
            {sidebarOpen && (
              <>
                <SLinkLabel>{label}</SLinkLabel>
              </>
            )}
          </SLink>
        </SLinkContainer>
      ))}
      <SDivider />
      <STheme>
        {sidebarOpen && <SThemeLabel>Dark Mode</SThemeLabel>}
        <SThemeToggler
          isActive={theme === "dark"}
          onClick={() => setTheme((p) => (p === "light" ? "dark" : "light"))}
        >
          <SToggleThumb style={theme === "dark" ? { right: "1px" } : {}} />
        </SThemeToggler>
      </STheme>
    </SSidebar>
  );
};

const linksArray = [
  {
    label: "Home",
    icon: <AiOutlineHome />,
    to: "/",
  },
  {
    label: "University",
    icon: <FaUniversity />,
    to: "/universityPage",
  },
  {
    label: "Tools",
    icon: <AiOutlineTool />,
    to: "/toolsPage",
  },
  {
    label: "Links",
    icon: <FiLink2 />,
    to: "/linksPage",
  },
];

const secondaryLinksArray = [
  {
    label: "Notes",
    icon: <BiNotepad />,
    to: "/notesPage",
  },
  {
    label: "Diagram maker",
    icon: <BsDiagram2 />,
    to: "/diagramMakerPage",
  },
];

export default Sidebar;
