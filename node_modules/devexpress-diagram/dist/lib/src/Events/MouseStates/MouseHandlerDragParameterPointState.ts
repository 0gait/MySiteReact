import { Point } from "@devexpress/utils/lib/geometry/point";
import { Shape } from "../../Model/Shapes/Shape";
import { DiagramMouseEvent } from "../Event";
import { MouseHandlerDraggingState } from "./MouseHandlerDraggingState";
import { ShapeParameters } from "../../Model/Shapes/ShapeParameters";
import { ChangeShapeParametersHistoryItem } from "../../History/Common/ChangeShapeParametersHistoryItem";
import { MouseHandler } from "../MouseHandler";
import { History } from "../../History/History";
import { DiagramModel } from "../../Model/Model";
import { ItemKey } from "../../Model/DiagramItem";

export class MouseHandlerDragParameterPointState extends MouseHandlerDraggingState {
    startPoint: Point;
    parameterPointKey: string;
    shape: Shape;

    startScrollLeft = 0;
    startScrollTop = 0;
    startParameters: ShapeParameters;

    constructor(handler: MouseHandler, history: History, protected model: DiagramModel) {
        super(handler, history);
    }

    onMouseDown(evt: DiagramMouseEvent) {
        this.startPoint = evt.modelPoint;
        this.shape = this.model.findShape(evt.source.key);
        this.parameterPointKey = evt.source.value;
        this.startParameters = this.shape.parameters.clone();
        super.onMouseDown(evt);
    }
    onApplyChanges(evt: DiagramMouseEvent) {
        const offset = this.handler.getSnappedOffsetOnDragPoint(evt, this.startPoint);
        const parameters = this.startParameters.clone();
        this.shape.description.modifyParameters(this.shape, parameters, offset.x, offset.y);
        this.history.addAndRedo(new ChangeShapeParametersHistoryItem(this.shape.key, parameters));
    }

    getDraggingElementKeys(): ItemKey[] {
        return [this.shape.key];
    }
}
