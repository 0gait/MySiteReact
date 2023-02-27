import { ItemDataKey } from "../Model/DiagramItem";
import { IImportEdgeItem, IImportNodeItem } from "./Interfaces";
import { ConnectorLineOption, ConnectorLineEnding } from "../Model/Connectors/ConnectorProperties";
import { CONNECTOR_DEFAULT_TEXT_POSITION } from "../Model/Connectors/Connector";

export class DataSourceItem {
    customData: any;

    locked: boolean;

    style: any;
    styleText: any;
    zIndex: number;

    constructor(public sourceKey: string, public key: ItemDataKey, public dataObj: any) { }
}

export class DataSourceNodeItem extends DataSourceItem implements IImportNodeItem {
    image: string;

    left: number;
    top: number;
    width: number;
    height: number;

    constructor(sourceKey: string, key: ItemDataKey, dataObj: any, public type: string, public text: string,
        public parentDataObj?: any, public containerKey?: ItemDataKey, public containerDataObj?: any) {
        super(sourceKey, key, dataObj);
    }
}

export class DataSourceEdgeItem extends DataSourceItem implements IImportEdgeItem {
    fromPointIndex: number;
    toPointIndex: number;

    points: any[];

    texts: any;

    lineOption: ConnectorLineOption;
    startLineEnding: ConnectorLineEnding;
    endLineEnding: ConnectorLineEnding;

    constructor(public sourceKey: string, key: ItemDataKey, dataObj: any, public from: ItemDataKey, public to: ItemDataKey) {
        super(sourceKey, key, dataObj);
    }

    get text() {
        return this.texts && this.texts[CONNECTOR_DEFAULT_TEXT_POSITION];
    }
}
