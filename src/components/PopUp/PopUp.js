import React, { Fragment, useState } from "react";
import { Button } from "devextreme-react/button";
import { Popup } from "devextreme-react/popup";
import { TextBox } from "devextreme-react/text-box";
import { Container1 } from "./styles";

const PopUp = () => {
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [inputValue, setInputValue] = useState();
  const [password, setPassword] = useState(false);

  const togglePopup = () => {
    setPopupVisibility(!isPopupVisible);
  };

  const keyUpFunction = (e) => {
    if (e.event.key === "Enter") {
      if (inputValue === "magicRoom") {
        setPassword(true);
      } else {
        alert("Wrong password!!!");
      }
    }
  };

  const valueChanged = (e) => {
    setInputValue(e.value);
  };

  return (
    <Fragment>
      <Popup
        title="Secret page"
        visible={isPopupVisible}
        hideOnOutsideClick={true}
        onHiding={togglePopup}
        width={300}
        height={170}
      >
        <Container1>
          {password}
          Password:
          <TextBox
            onValueChanged={valueChanged}
            onKeyDown={keyUpFunction}
            width={250}
            mode="password"
          />
        </Container1>
      </Popup>
      <Button icon="lock" onClick={togglePopup} width={80} />
    </Fragment>
  );
};

export default PopUp;
