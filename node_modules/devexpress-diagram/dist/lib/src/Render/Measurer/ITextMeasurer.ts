import { StyleBase } from "../../Model/Style";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { DiagramItem } from "../../Model/DiagramItem";
import { IDOMManipulator } from "../DOMManipulator";
import { ITextMeasureResult } from "../../Utils/TextUtils";

export enum TextOwner {
    Shape = 0,
    Connector = 1,
    ExtensionLine = 2,
    Resize = 3
}

export interface ITextMeasurer {
    measureWords(textOrWords: string[] | string, style: StyleBase, owner: TextOwner): ITextMeasureResult;
    measureTextLine(textLine: string, style: StyleBase, owner: TextOwner): Size;
    onNewModel(items: DiagramItem[], dom: IDOMManipulator);
}
