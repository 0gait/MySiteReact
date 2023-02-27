import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Shape } from "../../Model/Shapes/Shape";
import { ItemKey } from "../../Model/DiagramItem";
import { ImageInfo } from "../../Images/ImageInfo";

export class ChangeShapeImageHistoryItem extends HistoryItem {
    shapeKey: ItemKey;
    imageUrl: string;
    oldImage: ImageInfo;

    constructor(item: Shape, imageUrl: string) {
        super();
        this.shapeKey = item.key;
        this.imageUrl = imageUrl;
    }
    redo(manipulator: ModelManipulator) {
        const item = manipulator.model.findShape(this.shapeKey);
        this.oldImage = item.image;
        manipulator.changeShapeImage(item, new ImageInfo(this.imageUrl));
    }
    undo(manipulator: ModelManipulator) {
        const item = manipulator.model.findShape(this.shapeKey);
        manipulator.changeShapeImage(item, this.oldImage);
    }
}
