import { ChangeStylePropertyCommand } from "./ChangeStylePropertyCommand";

export class ChangeStrokeStyleCommand extends ChangeStylePropertyCommand {
    getStyleProperty(): string {
        return "stroke-dasharray";
    }
}
