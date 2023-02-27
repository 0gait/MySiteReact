import { ToggleStyleTextPropertyCommand } from "./ToggleStyleTextPropertyCommand";

export class ToggleFontUnderlineCommand extends ToggleStyleTextPropertyCommand {
    getStyleProperty() {
        return "text-decoration";
    }
    getStylePropertyValue() {
        return "underline";
    }
}
