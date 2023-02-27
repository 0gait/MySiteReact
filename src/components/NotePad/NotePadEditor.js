import React, { Fragment } from "react";
import styled from "styled-components";
import HtmlEditor, {
  TableContextMenu,
  MediaResizing,
  Toolbar,
  Item,
  ImageUpload,
} from "devextreme-react/html-editor";
import "devextreme/ui/html_editor/converters/markdown";

const NotePadEditor = () => {
  const markup = localStorage.getItem("Markup");
  const sizeValues = ["8pt", "10pt", "12pt", "14pt", "18pt", "24pt", "36pt"];
  const fontValues = [
    "Arial",
    "Georgia",
    "Tahoma",
    "Times New Roman",
    "Verdana",
  ];
  const headerValues = [false, 1, 2, 3, 4, 5];
  const tabs = [
    { name: "From This Device", value: ["file"] },
    { name: "From the Web", value: ["url"] },
    { name: "Both", value: ["file", "url"] },
  ];

  let markupValue = ``;

  const onValueChanged = (e) => {
    markupValue = e.value;
  };

  const save = () => {
    localStorage.setItem("Markup", markupValue);
  };

  const deleteAll = () => {
    localStorage.removeItem("Markup");
  };

  return (
    <Fragment>
      <HtmlEditorContainer>
        <HtmlEditor
          defaultValue={markup}
          onValueChanged={onValueChanged}
          onFocusOut={save}
          valueType="html"
          height={655}
          width={1100}
        >
          <MediaResizing enabled={true} />
          <ImageUpload tabs={tabs[2].value} fileUploadMode="base64" />
          <Toolbar multiline={true}>
            <Item name="undo" />
            <Item name="redo" />
            <Item name="separator" />
            <Item name="size" acceptedValues={sizeValues} />
            <Item name="font" acceptedValues={fontValues} />
            <Item name="separator" />
            <Item name="bold" />
            <Item name="italic" />
            <Item name="strike" />
            <Item name="underline" />
            <Item name="separator" />
            <Item name="alignLeft" />
            <Item name="alignCenter" />
            <Item name="alignRight" />
            <Item name="alignJustify" />
            <Item name="separator" />
            <Item name="orderedList" />
            <Item name="bulletList" />
            <Item name="separator" />
            <Item name="header" acceptedValues={headerValues} />
            <Item name="separator" />
            <Item name="color" />
            <Item name="background" />
            <Item name="separator" />
            <Item name="link" />
            <Item name="image" />
            <Item name="separator" />
            <Item name="clear" />
            <Item name="codeBlock" />
            <Item name="blockquote" />
            <Item name="separator" />
            <Item name="insertTable" />
            <Item name="deleteTable" />
            <Item name="insertRowAbove" />
            <Item name="insertRowBelow" />
            <Item name="deleteRow" />
            <Item name="insertColumnLeft" />
            <Item name="insertColumnRight" />
            <Item name="deleteColumn" />
            <Item name="cellProperties" />
            <Item name="tableProperties" />
          </Toolbar>
          <TableContextMenu enabled={true} />
          <MediaResizing enabled={true} />
        </HtmlEditor>
      </HtmlEditorContainer>
      <Button1 onClick={deleteAll}>Delete notes</Button1>
    </Fragment>
  );
};

export default NotePadEditor;

const HtmlEditorContainer = styled.div`
  background-color: white;
`;

const Button1 = styled.button`
  background-color: #bf000a;
  color: white;
  border-radius: 8px;
  padding: 4px 20px;
  outline: 0;
  text-transform: uppercase;
  cursor: pointer;
  transition: ease background-color 250ms;
  &:hover {
    background-color: #a7a8a7;
    color: #bf000a;
  }
  &:disabled {
    cursor: default;
    opacity: 0.5;
  }
  margin-left: 10px;
  margin-top: 8px;
  font-family: inherit;
  letter-spacing: inherit;
  font-size: 13px;
`;
