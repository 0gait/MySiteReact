import { ItemDataKey } from "../Model/DiagramItem";
import { ConnectorLineOption, ConnectorLineEnding } from "../Model/Connectors/ConnectorProperties";
import { DataLayoutType } from "./DataLayoutParameters";
import { DataLayoutOrientation } from "../Layout/LayoutSettings";

export interface IItemDataImporter {
    getKey?: (obj: any) => ItemDataKey;
    setKey?: (obj: any, value: ItemDataKey) => void;

    getCustomData?: (obj: any) => any;
    setCustomData?: (obj: any, value: any) => void;

    getLocked?: (obj: any) => boolean;
    setLocked?: (obj: any, value: boolean) => void;

    getStyle?: (obj: any) => any;
    setStyle?: (obj: any, value: any) => void;
    getStyleText?: (obj: any) => any;
    setStyleText?: (obj: any, value: any) => void;
    getZIndex?: (obj: any) => number;
    setZIndex?: (obj: any, value: number) => void;
}

export interface INodeDataImporter extends IItemDataImporter {
    getType?: (obj: any) => string;
    setType?: (obj: any, value: string) => void;

    getText?: (obj: any) => string;
    setText?: (obj: any, value: string) => void;
    getImage?: (obj: any) => string;
    setImage?: (obj: any, value: string) => void;

    getLeft?: (obj: any) => number;
    setLeft?: (obj: any, value: number) => void;
    getTop?: (obj: any) => number;
    setTop?: (obj: any, value: number) => void;
    getWidth?: (obj: any) => number;
    setWidth?: (obj: any, value: number) => void;
    getHeight?: (obj: any) => number;
    setHeight?: (obj: any, value: number) => void;

    getContainerKey?: (obj: any) => ItemDataKey;
    setContainerKey?: (obj: any, val: ItemDataKey) => void;
    getChildren?: (obj: any) => any[];
    setChildren?: (obj: any, value: any[]) => void;

    getParentKey?: (obj: any) => ItemDataKey;
    setParentKey?: (obj: any, value: ItemDataKey) => void;
    getItems?: (obj: any) => any[];
    setItems?: (obj: any, value: any[]) => void;
}

export interface IEdgeDataImporter extends IItemDataImporter {
    getFrom?: (obj: any) => ItemDataKey;
    setFrom?: (obj: any, value: ItemDataKey) => void;
    getFromPointIndex?: (obj: any) => number;
    setFromPointIndex?: (obj: any, value: number) => void;
    getTo?: (obj: any) => ItemDataKey;
    setTo?: (obj: any, value: ItemDataKey) => void;
    getToPointIndex?: (obj: any) => number;
    setToPointIndex?: (obj: any, value: number) => void;
    getPoints?: (obj: any) => any[];
    setPoints?: (obj: any, value: any[]) => void;

    getText?: (obj: any) => any;
    setText?: (obj: any, value: any) => void;

    getLineOption?: (obj: ConnectorLineOption) => number;
    setLineOption?: (obj: any, value: ConnectorLineOption) => void;
    getStartLineEnding?: (obj: ConnectorLineEnding) => number;
    setStartLineEnding?: (obj: any, value: ConnectorLineEnding) => void;
    getEndLineEnding?: (obj: ConnectorLineEnding) => number;
    setEndLineEnding?: (obj: any, value: ConnectorLineEnding) => void;
}

export interface IImportItem {
    key: ItemDataKey;
    text: string;
    sourceKey: string;
}

export interface IImportEdgeItem extends IImportItem {
    from: ItemDataKey;
    to: ItemDataKey;
}

export interface IImportNodeItem extends IImportItem {
    type: string;
}

export interface IDataLayoutImportParameters {
    type: DataLayoutType;
    orientation: DataLayoutOrientation;
    skipPointIndices: boolean;
    autoSizeEnabled: boolean;
}

export interface IDataImportParameters {
    addInternalKeyOnInsert?: boolean;
}

export interface IDataChangesListener {
    notifyEdgeInserted(data: any, callback?: (data: any) => void): void;
    notifyEdgeUpdated(key: ItemDataKey, data: any, callback?: (key: ItemDataKey, data: any) => void): void;
    notifyEdgeRemoved(key: ItemDataKey, data: any, callback?: (key: ItemDataKey, data: any) => void): void;
    notifyNodeInserted(data: any, callback?: (data: any) => void): void;
    notifyNodeUpdated(key: ItemDataKey, data: any, callback?: (key: ItemDataKey, data: any) => void): void;
    notifyNodeRemoved(key: ItemDataKey, data: any, callback?: (key: ItemDataKey, data: any) => void): void;
    beginChangesNotification() : void;
    endChangesNotification(preventNotifyChanges : boolean) : void;
    reloadInsertedItem(dataKey: ItemDataKey) : void;
}
