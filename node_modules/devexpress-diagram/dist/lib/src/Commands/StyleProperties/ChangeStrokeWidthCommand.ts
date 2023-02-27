import { ChangeStylePropertyCommand } from "./ChangeStylePropertyCommand";

export class ChangeStrokeWidthCommand extends ChangeStylePropertyCommand {
    getStyleProperty(): string {
        return "stroke-width";
    }
}
