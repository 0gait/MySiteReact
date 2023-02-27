import { EventDispatcher } from "./Utils";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { DiagramUnit } from "./Enums";
import { ModelUtils } from "./Model/ModelUtils";

export interface IShapeSizeSettings {
    shapeMinHeight?: number;
    shapeMaxHeight?: number;
    shapeMinWidth?: number;
    shapeMaxWidth?: number;
}

export class DiagramSettings implements IShapeSizeSettings {
    onZoomChanged: EventDispatcher<IZoomChangesListener> = new EventDispatcher();
    onViewChanged: EventDispatcher<IViewChangesListener> = new EventDispatcher();
    onReadOnlyChanged: EventDispatcher<IReadOnlyChangesListener> = new EventDispatcher();
    onConnectorRoutingModeChanged : EventDispatcher<IConnectorRoutingModeListener> = new EventDispatcher();

    private _zoomLevel: number = 1;
    private _zoomLevelWasChanged: boolean = false;
    private _zoomLevelItems: number[] = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
    private _simpleView: boolean = false;
    private _fullscreen: boolean = false;
    private _readOnly: boolean = false;
    private _autoZoom: AutoZoomMode = AutoZoomMode.Disabled;
    private _snapToGrid: boolean = true;
    private _showGrid: boolean = true;
    private _contextMenuEnabled: boolean = true;
    private _gridSize: number = 180;
    private _gridSizeItems: number[] = [90, 180, 360, 720];
    private _pageSizeItems: any[] = [
        { size: new Size(12240, 15840), text: "US-Letter ({width} x {height})" },
        { size: new Size(12240, 20160), text: "US-Legal ({width} x {height})" },
        { size: new Size(15817, 24491), text: "US-Tabloid ({width} x {height})" },
        { size: new Size(47679, 67408), text: "A0 ({width} x {height})" },
        { size: new Size(33676, 47679), text: "A1 ({width} x {height})" },
        { size: new Size(23811, 33676), text: "A2 ({width} x {height})" },
        { size: new Size(16838, 23811), text: "A3 ({width} x {height})" },
        { size: new Size(11906, 16838), text: "A4 ({width} x {height})" },
        { size: new Size(8391, 11906), text: "A5 ({width} x {height})" },
        { size: new Size(5953, 8391), text: "A6 ({width} x {height})" },
        { size: new Size(4195, 5953), text: "A7 ({width} x {height})" }
    ];
    private _viewUnits: DiagramUnit = DiagramUnit.In;
    private _connectorRoutingMode: ConnectorRoutingMode = ConnectorRoutingMode.AllShapesOnly;
    private _reloadInsertedItemRequired: boolean = false;
    private _useCanvgForExportToImage: boolean = true;

    get zoomLevel(): number { return this._zoomLevel; }
    set zoomLevel(value: number) {
        value = DiagramSettings.correctZoomLevel(value);
        if(value !== this._zoomLevel) {
            this._zoomLevel = value;
            this._zoomLevelWasChanged = true;
            this.onZoomChanged.raise1(listener => listener.notifyZoomChanged(value, this._autoZoom));
        }
    }
    get zoomLevelWasChanged(): boolean { return this._zoomLevelWasChanged; }
    get zoomLevelItems(): number[] { return this._zoomLevelItems; }
    set zoomLevelItems(value: number[]) {
        value = value.map(l => DiagramSettings.correctZoomLevel(l));
        if(value !== this._zoomLevelItems)
            this._zoomLevelItems = value;
    }
    get autoZoom(): AutoZoomMode { return this._autoZoom; }
    set autoZoom(value: AutoZoomMode) {
        if(value !== this._autoZoom) {
            this._autoZoom = value;
            this.onZoomChanged.raise1(l => l.notifyZoomChanged(this._zoomLevel, value));
        }
    }

    get simpleView(): boolean { return this._simpleView; }
    set simpleView(value: boolean) {
        if(value !== this._simpleView) {
            this._simpleView = value;
            this.notifyViewChanged();
        }
    }
    get readOnly(): boolean { return this._readOnly; }
    set readOnly(value: boolean) {
        if(value !== this._readOnly) {
            this._readOnly = value;
            this.onReadOnlyChanged.raise1(listener => listener.notifyReadOnlyChanged(value));
        }
    }
    get fullscreen(): boolean { return this._fullscreen; }
    set fullscreen(value: boolean) { this._fullscreen = value; }

    get snapToGrid(): boolean { return this._snapToGrid; }
    set snapToGrid(value: boolean) { this._snapToGrid = value; }

    get showGrid(): boolean { return this._showGrid; }
    set showGrid(value: boolean) {
        if(value !== this._showGrid) {
            this._showGrid = value;
            this.onViewChanged.raise1(l => l.notifyGridChanged(this.showGrid, this.gridSize));
        }
    }
    get contextMenuEnabled(): boolean { return this._contextMenuEnabled; }
    set contextMenuEnabled(value: boolean) {
        this._contextMenuEnabled = value;
    }

    get gridSize(): number { return this._gridSize; }
    set gridSize(value: number) {
        if(value !== this._gridSize) {
            this._gridSize = value;
            this.onViewChanged.raise1(l => l.notifyGridChanged(this.showGrid, this.gridSize));
        }
    }
    get gridSizeItems(): number[] { return this._gridSizeItems; }
    set gridSizeItems(value: number[]) {
        if(value !== this._gridSizeItems)
            this._gridSizeItems = value;
    }

    get pageSizeItems(): any[] { return this._pageSizeItems; }
    set pageSizeItems(value: any[]) {
        if(value !== this._pageSizeItems)
            this._pageSizeItems = value;
    }

    get viewUnits(): DiagramUnit { return this._viewUnits; }
    set viewUnits(value: DiagramUnit) { this._viewUnits = value; }

    get connectorRoutingMode(): ConnectorRoutingMode { return this._connectorRoutingMode; }
    set connectorRoutingMode(value: ConnectorRoutingMode) {
        if(value !== this._connectorRoutingMode) {
            this._connectorRoutingMode = value;
            this.onConnectorRoutingModeChanged.raise1(listener => listener.notifyConnectorRoutingModeChanged(value));
        }
    }

    get reloadInsertedItemRequired(): boolean { return this._reloadInsertedItemRequired; }
    set reloadInsertedItemRequired(value: boolean) {
        this._reloadInsertedItemRequired = value;
    }

    get useCanvgForExportToImage(): boolean { return this._useCanvgForExportToImage; }
    set useCanvgForExportToImage(value: boolean) {
        this._useCanvgForExportToImage = value;
    }

    private _shapeMinWidth: number | undefined;
    get shapeMinWidth(): number | undefined { return this._shapeMinWidth; }
    set shapeMinWidth(value: number | undefined) { this._shapeMinWidth = value; }

    private _shapeMinHeight: number | undefined;
    get shapeMinHeight(): number | undefined { return this._shapeMinHeight; }
    set shapeMinHeight(value: number | undefined) { this._shapeMinHeight = value; }

    private _shapeMaxWidth: number | undefined;
    get shapeMaxWidth(): number | undefined { return this._shapeMaxWidth; }
    set shapeMaxWidth(value: number | undefined) { this._shapeMaxWidth = value; }

    private _shapeMaxHeight: number | undefined;
    get shapeMaxHeight(): number | undefined { return this._shapeMaxHeight; }
    set shapeMaxHeight(value: number | undefined) { this._shapeMaxHeight = value; }

    applyShapeSizeSettings(settings: IShapeSizeSettings | undefined, units: DiagramUnit): void {
        if(!settings) return;
        if(typeof (settings.shapeMaxHeight) === "number")
            this.shapeMaxHeight = ModelUtils.getTwipsValue(units, settings.shapeMaxHeight);
        if(typeof (settings.shapeMinHeight) === "number")
            this.shapeMinHeight = ModelUtils.getTwipsValue(units, settings.shapeMinHeight);
        if(typeof (settings.shapeMaxWidth) === "number")
            this.shapeMaxWidth = ModelUtils.getTwipsValue(units, settings.shapeMaxWidth);
        if(typeof (settings.shapeMinWidth) === "number")
            this.shapeMinWidth = ModelUtils.getTwipsValue(units, settings.shapeMinWidth);
    }
    notifyViewChanged(): void {
        this.onViewChanged.raise1(listener => listener.notifyViewChanged(this._simpleView));
    }
    static correctZoomLevel(level: number): number {
        return Math.min(10, Math.max(level, 0.01));
    }
}

export interface IZoomChangesListener {
    notifyZoomChanged(fixedZoomLevel: number, autoZoom: AutoZoomMode);
}
export interface IViewChangesListener {
    notifyViewChanged(simpleView: boolean);
    notifyGridChanged(gridShow: boolean, gridSize: number);
}
export interface IReadOnlyChangesListener {
    notifyReadOnlyChanged(readOnly: boolean);
}
export interface IConnectorRoutingModeListener {
    notifyConnectorRoutingModeChanged(connectorRoutingMode: ConnectorRoutingMode);
}

export enum AutoZoomMode {
    Disabled = 0,
    FitContent = 1,
    FitToWidth = 2
}

export enum ConnectorRoutingMode {
    None = 0,
    ConnectorShapesOnly = 1,
    AllShapesOnly = 2,
}
