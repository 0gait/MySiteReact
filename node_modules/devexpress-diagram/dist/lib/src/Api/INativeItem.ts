import { Size, Point, DiagramUnit } from "..";

export interface INativeItem {
    id: string;
    key: any;

    applyUnits(units: DiagramUnit): void;
}

export interface INativeShape extends INativeItem {
    text: string;
    type: string;

    position: Point;
    size: Size;
    attachedConnectorIds: string[];

    containerId?: string;
    containerChildItemIds: string[];
    containerExpanded: boolean;
}

export interface INativeConnector extends INativeItem {
    fromKey: any;
    toKey: any;
    texts: string[];

    fromId: string;
    fromPointIndex: number;
    toId: string;
    toPointIndex: number;
    points: Point[];
}
