import { DiagramItem } from "../../Model/DiagramItem";
import { SimpleCommandBase } from "../SimpleCommandBase";

export abstract class StylePropertyCommandBase extends SimpleCommandBase {
    abstract getValue(): any;
    abstract getStyleObj(item: DiagramItem): any;
    abstract getDefaultStyleObj(): any;
    abstract getStyleProperty(): string;
    protected lockInputPositionUpdating() {
        return true;
    }
}
