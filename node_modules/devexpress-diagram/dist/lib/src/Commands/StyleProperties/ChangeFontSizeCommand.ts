import { ChangeStyleTextPropertyCommand } from "./ChangeStyleTextPropertyCommand";

export class ChangeFontSizeCommand extends ChangeStyleTextPropertyCommand {
    getStyleProperty(): string {
        return "font-size";
    }
}
