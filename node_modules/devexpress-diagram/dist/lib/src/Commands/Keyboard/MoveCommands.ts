import { SimpleCommandState } from "../CommandStates";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ModelUtils } from "../../Model/ModelUtils";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { SimpleCommandBase } from "../SimpleCommandBase";
import { DiagramModelOperation } from "../..";

export abstract class MoveCommand extends SimpleCommandBase {
    isEnabled(): boolean {
        return super.isEnabled() && !this.control.selection.isEmpty();
    }
    executeCore(state: SimpleCommandState, parameter: any): boolean {
        this.control.history.beginTransaction();
        const selection = this.control.selection;

        const selectedShapes = selection.getSelectedShapes();
        const selectedShapesWithoutDuplicates = selectedShapes.filter(shape => {
            while(shape.container) {
                if(selectedShapes.indexOf(shape.container) !== -1) return false;
                shape = shape.container;
            }
            return true;
        });
        selectedShapesWithoutDuplicates.forEach(shape => {
            this.permissionsProvider.addInteractingItem(shape, DiagramModelOperation.MoveShape);
            const pos = this.getPosition(shape.position);
            ModelUtils.setShapePosition(this.control.history, this.control.model, shape, pos);
            ModelUtils.updateShapeAttachedConnectors(this.control.history, this.control.model, shape);
            this.permissionsProvider.clearInteractingItems();
        });

        const selectedItems = ModelUtils.createSelectedItems(selection);
        selection.getSelectedConnectors().forEach(connector => {
            if(ModelUtils.canMoveConnector(selectedItems, connector)) {
                const startPtIndex = connector.beginItem ? 1 : 0;
                const endPtIndex = connector.endItem ? (connector.points.length - 2) : (connector.points.length - 1);
                for(let i = startPtIndex; i <= endPtIndex; i++) {
                    const pos = this.getPosition(connector.points[i]);
                    ModelUtils.moveConnectorPoint(this.control.history, connector, i, pos);
                }
            }
        });

        ModelUtils.tryUpdateModelRectangle(this.control.history);
        this.control.history.endTransaction();

        return true;
    }
    protected get isPermissionsRequired(): boolean { return true; }
    abstract getPosition(position: Point): Point;
}

export class MoveLeftCommand extends MoveCommand {
    getPosition(position: Point): Point {
        return position.clone().offset(-UnitConverter.pixelsToTwips(1), 0);
    }
}

export class MoveStepLeftCommand extends MoveCommand {
    getPosition(position: Point): Point {
        if(this.control.settings.snapToGrid)
            return new Point(ModelUtils.getSnappedPos(this.control.model, this.control.settings.gridSize,
                position.x - (this.control.settings.gridSize / 2 + 2), true), position.y);
        else
            return position.clone().offset(-this.control.settings.gridSize, 0);
    }
}

export class MoveRightCommand extends MoveCommand {
    getPosition(position: Point): Point {
        return position.clone().offset(UnitConverter.pixelsToTwips(1), 0);
    }
}

export class MoveStepRightCommand extends MoveCommand {
    getPosition(position: Point): Point {
        if(this.control.settings.snapToGrid)
            return new Point(ModelUtils.getSnappedPos(this.control.model, this.control.settings.gridSize,
                position.x + (this.control.settings.gridSize / 2 + 2), true), position.y);
        else
            return position.clone().offset(this.control.settings.gridSize, 0);
    }
}

export class MoveUpCommand extends MoveCommand {
    getPosition(position: Point): Point {
        return position.clone().offset(0, -UnitConverter.pixelsToTwips(1));
    }
}

export class MoveStepUpCommand extends MoveCommand {
    getPosition(position: Point): Point {
        if(this.control.settings.snapToGrid)
            return new Point(position.x, ModelUtils.getSnappedPos(this.control.model, this.control.settings.gridSize,
                position.y - (this.control.settings.gridSize / 2 + 2), false));
        else
            return position.clone().offset(0, -this.control.settings.gridSize);
    }
}

export class MoveDownCommand extends MoveCommand {
    getPosition(position: Point): Point {
        return position.clone().offset(0, UnitConverter.pixelsToTwips(1));
    }
}

export class MoveStepDownCommand extends MoveCommand {
    getPosition(position: Point): Point {
        if(this.control.settings.snapToGrid)
            return new Point(position.x, ModelUtils.getSnappedPos(this.control.model, this.control.settings.gridSize,
                position.y + (this.control.settings.gridSize / 2 + 2), false));
        else
            return position.clone().offset(0, this.control.settings.gridSize);
    }
}

