import { ItemDataKey } from "./Model/DiagramItem";
import { IDataLayoutImportParameters } from "./Data/Interfaces";

export interface IReloadContentData {
    nodeDataSource?: any[];
    edgeDataSource?: any[];
}

export class ReloadContentParameters {
    private isEmpty = true;

    private _dataKeys: ItemDataKey[];
    private _getData: () => IReloadContentData;
    private _layoutParameters: IDataLayoutImportParameters;

    add(dataKey?: ItemDataKey|ItemDataKey[], getData?: () => IReloadContentData, layoutParameters?: IDataLayoutImportParameters): void {
        if(dataKey !== undefined) {
            if(this._dataKeys === undefined)
                this._dataKeys = [];
            if(Array.isArray(dataKey))
                this._dataKeys = this._dataKeys.concat(dataKey);
            else
                this._dataKeys.push(dataKey);
        }

        this._getData = this._getData || getData;
        this._layoutParameters = this._layoutParameters || layoutParameters;
        this.isEmpty = false;
    }
    clear(): void {
        this.isEmpty = true;
        this._dataKeys = undefined;
        this._getData = undefined;
        this._layoutParameters = undefined;
    }

    get empty(): boolean { return this.isEmpty; }
    get dataKeys(): ItemDataKey[] { return this._dataKeys; }
    get getData(): () => IReloadContentData { return this._getData; }
    get layoutParameters(): IDataLayoutImportParameters { return this._layoutParameters; }
}
