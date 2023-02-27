import { Selection } from "../../Selection/Selection";
import { MouseHandler } from "../MouseHandler";
import { IVisualizerManager } from "../Visualizers/VisualizersManager";
import { DiagramModel } from "../../Model/Model";
import { History } from "../../History/History";
import { MouseHandlerDragDiagramItemStateBase } from "./MouseHandlerDragDiagramItemStateBase";

export class MouseHandlerMoveShapeState extends MouseHandlerDragDiagramItemStateBase {
    constructor(handler: MouseHandler, history: History,
        protected model: DiagramModel,
        protected selection: Selection,
        protected visualizerManager: IVisualizerManager) {
        super(handler, history, model, selection, visualizerManager);
    }
    protected get areValidDraggingShapes() : boolean {
        return this.shouldClone || this.draggingShapes.length > 0;
    }
    protected get areValidDraggingConnectors() : boolean {
        return true;
    }
}
