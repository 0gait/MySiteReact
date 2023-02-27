import { ChangeStyleTextPropertyCommand } from "./ChangeStyleTextPropertyCommand";

export class ChangeFontNameCommand extends ChangeStyleTextPropertyCommand {
    getStyleProperty(): string {
        return "font-family";
    }
}
