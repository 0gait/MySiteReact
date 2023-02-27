import { ToggleStyleTextPropertyCommand } from "./ToggleStyleTextPropertyCommand";

export abstract class ChangeTextAlignCommand extends ToggleStyleTextPropertyCommand {
    getStyleProperty(): string {
        return "text-anchor";
    }
}

export class TextLeftAlignCommand extends ChangeTextAlignCommand {
    getStylePropertyValue() {
        return "start";
    }
}

export class TextCenterAlignCommand extends ChangeTextAlignCommand {
    getStylePropertyValue() {
        return "middle";
    }
}

export class TextRightAlignCommand extends ChangeTextAlignCommand {
    getStylePropertyValue() {
        return "end";
    }
}
