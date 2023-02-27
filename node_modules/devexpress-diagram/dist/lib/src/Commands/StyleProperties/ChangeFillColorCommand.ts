import { ChangeStylePropertyCommand } from "./ChangeStylePropertyCommand";
import { ColorUtils } from "@devexpress/utils/lib/utils/color";

export class ChangeFillColorCommand extends ChangeStylePropertyCommand {
    processParameter(parameter: string): string {
        return ColorUtils.stringToHash(parameter);
    }
    getStyleProperty(): string {
        return "fill";
    }
}
