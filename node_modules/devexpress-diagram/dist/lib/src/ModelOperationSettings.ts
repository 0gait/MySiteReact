export interface IModelOperationSettings {
    addShape?: boolean;
    addShapeFromToolbox?: boolean;
    deleteShape?: boolean;
    deleteConnector?: boolean;
    changeConnection?: boolean;
    changeConnectorPoints?: boolean;
    changeShapeText?: boolean;
    changeConnectorText?: boolean;
    resizeShape?: boolean;
    moveShape?: boolean;
}

export class ModelOperationSettings {
    private _addShape: boolean = true;
    private _addShapeFromToolbox: boolean = true;
    private _deleteShape: boolean = true;
    private _deleteConnector: boolean = true;
    private _changeConnection: boolean = true;
    private _changeConnectorPoints: boolean = true;
    private _changeShapeText: boolean = true;
    private _changeConnectorText: boolean = true;
    private _resizeShape: boolean = true;
    private _moveShape: boolean = true;

    get addShape(): boolean { return this._addShape; }
    set addShape(value: boolean) {
        if(value !== this._addShape)
            this._addShape = value;

    }

    get addShapeFromToolbox(): boolean { return this._addShapeFromToolbox; }
    set addShapeFromToolbox(value: boolean) {
        if(value !== this._addShapeFromToolbox)
            this._addShapeFromToolbox = value;

    }
    get deleteShape(): boolean { return this._deleteShape; }
    set deleteShape(value: boolean) {
        if(value !== this._deleteShape)
            this._deleteShape = value;

    }

    get deleteConnector(): boolean { return this._deleteConnector; }
    set deleteConnector(value: boolean) {
        if(value !== this._deleteConnector)
            this._deleteConnector = value;

    }

    get changeConnection(): boolean { return this._changeConnection; }
    set changeConnection(value: boolean) {
        if(value !== this._changeConnection)
            this._changeConnection = value;

    }

    get changeConnectorPoints(): boolean { return this._changeConnectorPoints; }
    set changeConnectorPoints(value: boolean) {
        if(value !== this._changeConnectorPoints)
            this._changeConnectorPoints = value;

    }

    get changeShapeText(): boolean { return this._changeShapeText; }
    set changeShapeText(value: boolean) {
        if(value !== this._changeShapeText)
            this._changeShapeText = value;

    }

    get changeConnectorText(): boolean { return this._changeConnectorText; }
    set changeConnectorText(value: boolean) {
        if(value !== this._changeConnectorText)
            this._changeConnectorText = value;

    }

    get resizeShape(): boolean { return this._resizeShape; }
    set resizeShape(value: boolean) {
        if(value !== this._resizeShape)
            this._resizeShape = value;

    }

    get moveShape(): boolean { return this._moveShape; }
    set moveShape(value: boolean) {
        if(value !== this._moveShape)
            this._moveShape = value;

    }

    applySettings(settings: IModelOperationSettings): void {
        if(!settings) return;
        if(typeof settings.addShape === "boolean")
            this.addShape = settings.addShape;
        if(typeof settings.addShapeFromToolbox === "boolean")
            this.addShapeFromToolbox = settings.addShapeFromToolbox;
        if(typeof settings.deleteShape === "boolean")
            this.deleteShape = settings.deleteShape;
        if(typeof settings.deleteConnector === "boolean")
            this.deleteConnector = settings.deleteConnector;
        if(typeof settings.changeConnection === "boolean")
            this.changeConnection = settings.changeConnection;
        if(typeof settings.changeConnectorPoints === "boolean")
            this.changeConnectorPoints = settings.changeConnectorPoints;
        if(typeof settings.changeShapeText === "boolean")
            this.changeShapeText = settings.changeShapeText;
        if(typeof settings.changeConnectorText === "boolean")
            this.changeConnectorText = settings.changeConnectorText;
        if(typeof settings.resizeShape === "boolean")
            this.resizeShape = settings.resizeShape;
        if(typeof settings.moveShape === "boolean")
            this.moveShape = settings.moveShape;
    }
}

export enum DiagramModelOperation {
    AddShape,
    AddShapeFromToolbox,
    DeleteShape,
    DeleteConnector,
    ChangeConnection,
    ChangeConnectorPoints,
    BeforeChangeShapeText,
    ChangeShapeText,
    BeforeChangeConnectorText,
    ChangeConnectorText,
    ResizeShape,
    MoveShape
}
