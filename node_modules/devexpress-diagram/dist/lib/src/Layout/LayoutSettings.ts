import { Connector } from "../Model/Connectors/Connector";

export class LayoutSettings {
    orientation: DataLayoutOrientation = DataLayoutOrientation.Vertical;
    direction: LogicalDirectionKind = LogicalDirectionKind.Forward;
    componentSpacing: number;
    layerSpacing: number;
    columnSpacing: number;
    containerPadding: number;

    constructor(gridSize?: number) {
        const baseSpacing = (gridSize && gridSize * 2 > Connector.minOffset) ? gridSize * 2 : Connector.minOffset;
        this.columnSpacing = baseSpacing;
        this.layerSpacing = baseSpacing * 2;
        this.containerPadding = baseSpacing * 2;
        this.componentSpacing = baseSpacing * 2;
    }
}

export class TreeLayoutSettings extends LayoutSettings {
    alignment: Alignment = Alignment.Center;
    subTreeColumnSpacing: number;

    constructor(gridSize?: number) {
        super(gridSize);
        this.subTreeColumnSpacing = this.componentSpacing / 2;
    }
}

export enum LogicalDirectionKind {
    Backward,
    Forward,
}
export enum DataLayoutOrientation {
    Horizontal,
    Vertical,
}

export enum Alignment {
    Left,
    Center
}
