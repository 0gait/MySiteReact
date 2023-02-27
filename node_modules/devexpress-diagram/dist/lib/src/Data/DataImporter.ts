import { ItemDataKey } from "../Model/DiagramItem";
import { INodeDataImporter, IEdgeDataImporter } from "./Interfaces";
import { ConnectorLineEnding, ConnectorLineOption } from "../Model/Connectors/ConnectorProperties";

export class DataSourceItemDataImporter {
    getKey: (obj: any) => ItemDataKey = (obj: any) => obj["id"];
    setKey: (obj: any, value: ItemDataKey) => void = (obj: any, value: ItemDataKey) => { obj["id"] = value; };

    getCustomData: (obj: any) => any = undefined;
    setCustomData: (obj: any, value: boolean) => void = undefined;

    getLocked: (obj: any) => boolean = undefined;
    setLocked: (obj: any, value: boolean) => void = undefined;

    getStyle: (obj: any) => any = undefined;
    setStyle: (obj: any, value: any) => void = undefined;
    getStyleText: (obj: any) => any = undefined;
    setStyleText: (obj: any, value: any) => void = undefined;
    getZIndex: (obj: any) => number = undefined;
    setZIndex: (obj: any, value: number) => void = undefined;
}

export class DataSourceNodeDataImporter extends DataSourceItemDataImporter implements INodeDataImporter {
    getType: (obj: any) => string = undefined;
    setType: (obj: any, value: string) => void = undefined;
    getText: (obj: any) => string = undefined;
    setText: (obj: any, value: string) => void = undefined;

    getImage: (obj: any) => string = undefined;
    setImage: (obj: any, value: string) => void = undefined;

    getLeft: (obj: any) => number = undefined;
    setLeft: (obj: any, value: number) => void = undefined;
    getTop: (obj: any) => number = undefined;
    setTop: (obj: any, value: number) => void = undefined;
    getWidth: (obj: any) => number = undefined;
    setWidth: (obj: any, value: number) => void = undefined;
    getHeight: (obj: any) => number = undefined;
    setHeight: (obj: any, value: number) => void = undefined;

    getChildren: (obj: any) => any[] = undefined;
    setChildren: (obj: any, value: any[]) => void = undefined;

    getParentKey: (obj: any) => ItemDataKey = undefined;
    setParentKey: (obj: any, value: ItemDataKey) => void = undefined;
    getItems: (obj: any) => any[] = undefined;
    setItems: (obj: any, value: any[]) => void = undefined;

    getContainerKey: (obj: any) => ItemDataKey = undefined;
    setContainerKey: (obj: any, value: ItemDataKey) => void = undefined;
}

export class DataSourceEdgeDataImporter extends DataSourceItemDataImporter implements IEdgeDataImporter {
    getFrom: (obj: any) => ItemDataKey = (obj: any) => obj["from"];
    setFrom: (obj: any, value: ItemDataKey) => void = (obj: any, value: ItemDataKey) => { obj["from"] = value; };
    getFromPointIndex: (obj: any) => number = undefined;
    setFromPointIndex: (obj: any, value: number) => void = undefined;
    getTo: (obj: any) => ItemDataKey = (obj: any) => obj["to"];
    setTo: (obj: any, value: ItemDataKey) => void = (obj: any, value: ItemDataKey) => { obj["to"] = value; };
    getToPointIndex: (obj: any) => number = undefined;
    setToPointIndex: (obj: any, value: number) => void = undefined;
    getPoints: (obj: any) => any[] = undefined;
    setPoints: (obj: any, value: any[]) => void = undefined;

    getText: (obj: any) => any = undefined;
    setText: (obj: any, value: any) => void = undefined;

    getLineOption: (obj: any) => ConnectorLineOption = undefined;
    setLineOption: (obj: any, value: ConnectorLineOption) => void = undefined;
    getStartLineEnding: (obj: any) => ConnectorLineEnding = undefined;
    setStartLineEnding: (obj: any, value: ConnectorLineEnding) => void = undefined;
    getEndLineEnding: (obj: any) => ConnectorLineEnding = undefined;
    setEndLineEnding: (obj: any, value: ConnectorLineEnding) => void = undefined;
}
