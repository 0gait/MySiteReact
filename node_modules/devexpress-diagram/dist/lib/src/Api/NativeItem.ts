import { INativeItem, INativeShape, INativeConnector } from "./INativeItem";
import { Point, Size, DiagramUnit } from "..";
import { ModelUtils } from "../Model/ModelUtils";

export abstract class NativeItem implements INativeItem {
    private unitsApplied = false;

    constructor(public id: string, public key: any) { }

    applyUnits(units: DiagramUnit): void {
        if(!this.unitsApplied && units !== undefined) {
            this.applyUnitsCore(units);
            this.unitsApplied = true;
        }
    }
    protected abstract applyUnitsCore(units: DiagramUnit): void;
}

export class NativeShape extends NativeItem implements INativeShape {
    text: string;
    type: string;

    position: Point;
    size: Size;
    attachedConnectorIds: string[];

    containerId?: string;
    containerChildItemIds: string[];
    containerExpanded: boolean;

    protected applyUnitsCore(units: DiagramUnit): void {
        this.position.x = ModelUtils.getlUnitValue(units, this.position.x);
        this.position.y = ModelUtils.getlUnitValue(units, this.position.y);
        this.size.width = ModelUtils.getlUnitValue(units, this.size.width);
        this.size.height = ModelUtils.getlUnitValue(units, this.size.height);
    }
}

export class NativeConnector extends NativeItem implements INativeConnector {
    fromKey: any;
    toKey: any;
    texts: string[];

    fromId: string;
    fromPointIndex: number;
    toId: string;
    toPointIndex: number;
    points: Point[];

    protected applyUnitsCore(units: DiagramUnit): void {
        this.points.forEach(pt => {
            pt.x = ModelUtils.getlUnitValue(units, pt.x);
            pt.y = ModelUtils.getlUnitValue(units, pt.y);
        });
    }
}
