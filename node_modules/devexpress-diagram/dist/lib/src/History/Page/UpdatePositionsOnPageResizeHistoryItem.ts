import { Point } from "@devexpress/utils/lib/geometry/point";
import { Vector } from "@devexpress/utils/lib/geometry/vector";

import { Connector } from "../../Model/Connectors/Connector";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { Shape } from "../../Model/Shapes/Shape";
import { HistoryItem } from "../HistoryItem";

export class UpdatePositionsOnPageResizeHistoryItem extends HistoryItem {
    constructor(public offset: Vector) {
        super();
    }
    redo(manipulator: ModelManipulator): void {
        manipulator.model.iterateItems(item => {
            if(item instanceof Shape)
                manipulator.moveShape(item, this.applyOffset(item.position, this.offset.x, this.offset.y));
            if(item instanceof Connector)
                manipulator.changeConnectorPoints(item, i => i.updatePointsOnPageResize(this.offset.x, this.offset.y));
        });
    }
    undo(manipulator: ModelManipulator): void {
        manipulator.model.iterateItems(item => {
            if(item instanceof Shape)
                manipulator.moveShape(item, this.applyOffset(item.position, -this.offset.x, -this.offset.y));
            if(item instanceof Connector)
                manipulator.changeConnectorPoints(item, i => i.updatePointsOnPageResize(-this.offset.x, -this.offset.y));
        });
    }

    private applyOffset(point: Point, offsetX: number, offsetY: number): Point {
        return point.clone().offset(offsetX, offsetY);
    }
}
