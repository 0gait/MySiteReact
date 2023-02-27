import { ToggleStyleTextPropertyCommand } from "./ToggleStyleTextPropertyCommand";

export class ToggleFontItalicCommand extends ToggleStyleTextPropertyCommand {
    getStyleProperty() {
        return "font-style";
    }
    getStylePropertyValue() {
        return "italic";
    }
}
