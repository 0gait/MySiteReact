import { ToggleStyleTextPropertyCommand } from "./ToggleStyleTextPropertyCommand";

export class ToggleFontBoldCommand extends ToggleStyleTextPropertyCommand {
    getStyleProperty() {
        return "font-weight";
    }
    getStylePropertyValue() {
        return "bold";
    }
}
