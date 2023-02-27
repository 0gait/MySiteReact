import React, { createRef, useEffect } from "react";
import Diagram from "devextreme-react/diagram";
import "whatwg-fetch";

const DiagramEditor = () => {
  const diagramRef = createRef();

  useEffect(() => {}, []);

  const onInitialized = () => {};

  return (
    <Diagram
      id="diagram"
      ref={diagramRef}
      onInitialized={onInitialized}
      showGrid={true}
      snapToGrid={false}
      pageOrientation={"landscape"}
      height={690}
      width={1100}
    />
  );
};

export default DiagramEditor;
