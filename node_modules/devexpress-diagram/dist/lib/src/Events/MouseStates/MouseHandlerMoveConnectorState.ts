import { History } from "../../History/History";
import { DiagramModel } from "../../Model/Model";
import { ModelUtils } from "../../Model/ModelUtils";
import { Selection } from "../../Selection/Selection";
import { MouseHandler } from "../MouseHandler";
import { IVisualizerManager } from "../Visualizers/VisualizersManager";
import { MouseHandlerDragDiagramItemStateBase } from "./MouseHandlerDragDiagramItemStateBase";

export class MouseHandlerMoveConnectorState extends MouseHandlerDragDiagramItemStateBase {
    constructor(handler: MouseHandler, history: History,
        protected model: DiagramModel,
        protected selection: Selection,
        protected visualizerManager: IVisualizerManager) {
        super(handler, history, model, selection, visualizerManager);
    }
    protected get areValidDraggingShapes() : boolean {
        return true;
    }
    protected get areValidDraggingConnectors() : boolean {
        if(this.shouldClone)
            return this.draggingShapes.length > 0 || this.draggingConnectors.length > 0;
        if(!this.draggingConnectors.length)
            return false;
        if(!this.draggingShapes.length)
            return !this.draggingConnectors.some(x => !ModelUtils.canMoveConnector(this.selectedItems, x.connector));
        return ModelUtils.canMoveConnector(this.selectedItems, this.draggingConnectors[this.draggingConnectorsIndexByKey[this.handler.mouseDownEvent.source.key]].connector);
    }
}
