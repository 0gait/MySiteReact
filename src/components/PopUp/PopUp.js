import React, { Fragment, useState } from "react";
import { Button } from "devextreme-react/button";
import { Popup } from "devextreme-react/popup";
import { TextBox } from "devextreme-react/text-box";
import { Container1 } from "./styles";
import { Image, ContainerImage } from "./styles";

const PopUp = () => {
  const [isPopupVisible, setPopupVisibility] = useState(false);
  const [password, setPassword] = useState(false);

  const togglePopup = () => {
    setPopupVisibility(!isPopupVisible);
    setPassword(false);
  };

  const keyUpFunction = (e) => {
    if (e.event.key === "Enter") {
      if (e.component.option("value") === "magicRoom") {
        setPassword(true);
      } else {
        alert("Wrong password!!!");
      }
    }
  };

  return (
    <Fragment>
      {!password ? (
        <Popup
          title="Secret page"
          visible={isPopupVisible}
          hideOnOutsideClick={true}
          onHiding={togglePopup}
          width={300}
          height={170}
        >
          <Container1>
            Password:
            <TextBox onKeyUp={keyUpFunction} width={250} mode="password" />
          </Container1>
        </Popup>
      ) : (
        <Popup
          title="❤ Precious things ❤"
          visible={isPopupVisible}
          hideOnOutsideClick={true}
          onHiding={togglePopup}
          width={900}
          height={620}
        >
          <Container1>
            <ContainerImage>
              <Image
                src={require("./assets/photo.jpg")}
                width="650"
                height="520"
              />
            </ContainerImage>
          </Container1>
        </Popup>
      )}
      <Button icon="lock" onClick={togglePopup} width={80} />
    </Fragment>
  );
};

export default PopUp;
