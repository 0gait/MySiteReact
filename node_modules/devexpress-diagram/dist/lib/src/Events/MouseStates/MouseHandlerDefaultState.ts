import { DiagramMouseEvent, MouseEventElementType, MouseButton } from "../Event";
import { MouseHandlerMoveConnectorPointState } from "./MouseHandlerMoveConnectorPointState";
import { MouseHandlerResizeShapeState } from "./MouseHandlerResizeShapeState";
import { MouseHandlerMoveConnectorSideState } from "./MouseHandlerMoveConnectorSideState";
import { MouseHandlerDragParameterPointState } from "./MouseHandlerDragParameterPointState";
import { MouseHandlerCreateConnectorState } from "./MouseHandlerCreateConnectorState";
import { MouseHandlerMoveConnectorOrthogonalSideState } from "./MouseHandlerMoveConnectorOrthogonalSideState";
import { DiagramDraggingEvent } from "../../Render/Toolbox/Toolbox";
import { MouseHandlerBeforeToolboxDraggingState } from "./MouseHandlerToolboxDraggingState";
import { MouseHandlerMoveConnectorTextState } from "./MouseHandlerMoveConnectorTextState";
import { MouseHandlerDefaultStateBase } from "./MouseHandlerDefaultStateBase";
import { MouseHandlerMoveShapeState } from "./MouseHandlerMoveShapeState";
import { ItemKey } from "../../Model/DiagramItem";
import { ConnectionPointInfo } from "../Visualizers/ConnectionPointsVisualizer";
import { ConnectorPosition } from "../../Model/Connectors/Connector";
import { MouseHandlerMoveConnectorState } from "./MouseHandlerMoveConnectorState";

export class MouseHandlerDefaultState extends MouseHandlerDefaultStateBase {
    finish() {
        this.visualizerManager.resetConnectionPoints();
        super.finish();
    }

    onMouseDownCore(evt: DiagramMouseEvent) {
        if(this.handler.canScrollPage(evt))
            this.startScrolling(evt);
        else if(evt.button === MouseButton.Left && evt.source.type === MouseEventElementType.ConnectorText) {
            this.handler.changeSingleSelection(evt.source.key);
            this.handler.switchState(new MouseHandlerMoveConnectorTextState(this.handler, this.history, this.model));
        }
        else if(evt.button === MouseButton.Left && evt.source.type === MouseEventElementType.ShapeResizeBox)
            this.handler.switchState(new MouseHandlerResizeShapeState(this.handler, this.history, this.model, this.selection, this.visualizerManager, this.settings));
        else if(evt.button === MouseButton.Left && evt.source.type === MouseEventElementType.ShapeParameterBox)
            this.handler.switchState(new MouseHandlerDragParameterPointState(this.handler, this.history, this.model));
        else if(evt.button === MouseButton.Left && evt.source.type === MouseEventElementType.ConnectorPoint)
            this.handler.switchState(new MouseHandlerMoveConnectorPointState(this.handler, this.history, this.model, this.visualizerManager));
        else if(evt.button === MouseButton.Left && evt.source.type === MouseEventElementType.ConnectorSide)
            this.handler.switchState(new MouseHandlerMoveConnectorSideState(this.handler, this.history, this.model));
        else if(evt.button === MouseButton.Left && evt.source.type === MouseEventElementType.ConnectorOrthogonalSide)
            this.handler.switchState(new MouseHandlerMoveConnectorOrthogonalSideState(this.handler, this.history, this.model));
        else if(evt.button === MouseButton.Left && evt.source.type === MouseEventElementType.ShapeConnectionPoint)
            this.handler.switchState(
                new MouseHandlerCreateConnectorState(this.handler, this.history, this.model,
                    this.visualizerManager, this.shapeDescriptionManager, this.selection)
            );
        else
            super.onMouseDownCore(evt);
    }
    onDragDiagramItemOnMouseDown(evt: DiagramMouseEvent) {
        if(!this.handler.canAddDiagramItemToSelection(evt))
            super.onDragDiagramItemOnMouseDown(evt);
        else if(evt.source.type === MouseEventElementType.Shape)
            this.handler.switchState(new MouseHandlerMoveShapeState(this.handler, this.history, this.model, this.selection, this.visualizerManager));
        else if(evt.source.type === MouseEventElementType.Connector)
            this.handler.switchState(new MouseHandlerMoveConnectorState(this.handler, this.history, this.model, this.selection, this.visualizerManager));
    }
    onDragStart(evt: DiagramDraggingEvent) {
        this.handler.switchState(
            new MouseHandlerBeforeToolboxDraggingState(this.handler, this.history, this.model, this.selection,
                this.visualizerManager, this.shapeDescriptionManager)
        );
        this.handler.state.onDragStart(evt);
    }
    onMouseMoveCore(evt: DiagramMouseEvent) {
        this.updateConnectionsOnMouseMove(evt);
        super.onMouseMoveCore(evt);
    }
    onMouseUp(evt: DiagramMouseEvent) {
        if(this.handler.canRemoveDiagramItemToSelection(evt))
            this.handler.removeDiagramItemFromSelection(evt.button, evt.source.key);
        else
            super.onMouseUp(evt);
    }
    updateConnectionsOnMouseMove(evt: DiagramMouseEvent) {
        const item = this.model.findItem(evt.source.key);
        this.visualizerManager.updateConnections(item, evt.source.type, evt.source.value);
    }
    canDragObjectOnMouseDown(key: ItemKey): boolean {
        return true;
    }
    canExpandContainerOnMouseDown(key: ItemKey): boolean {
        return true;
    }
    canClearSelectionOnMouseDown(): boolean {
        return false;
    }
    canSelectOnMouseUp(key: ItemKey): boolean {
        return false;
    }
    canClearSelectionOnMouseUp(): boolean {
        return true;
    }
    onConnectionPointsShow(key: string, points: ConnectionPointInfo[]): void {
        const shape = this.model.findShape(key);
        if(shape)
            points.forEach((point, index) => {
                point.allowed = this.handler.canPerformChangeConnectionOnUpdateUI(
                    undefined, { item: shape, position: ConnectorPosition.Begin, connectionPointIndex: index }
                );
            });
    }
}
