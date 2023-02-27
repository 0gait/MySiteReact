import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { DiagramSettings, AutoZoomMode, IZoomChangesListener } from "./Settings";
import { ICanvasViewListener } from "./Render/CanvasViewManager";
import { IBarManager } from "./UI/BarManager";
import { DiagramCommand } from "./Commands/CommandManager";
import { ICanvasViewManager } from "./Render/ICanvasViewManager";

const LOG_MIN_ZOOM = Math.log(0.05);
const LOG_MAX_ZOOM = Math.log(3);
const ZOOM_STEPS = 40;
const ZERO_STEP = getStepByZoom(1);

const ZOOMLEVEL_COMMANDS = [ DiagramCommand.ZoomLevel, DiagramCommand.ZoomLevelInPercentage, DiagramCommand.Zoom100, DiagramCommand.Zoom125, DiagramCommand.Zoom200, DiagramCommand.Zoom25, DiagramCommand.Zoom50, DiagramCommand.Zoom75 ];
const AUTOZOOM_COMMANDS = [ DiagramCommand.SwitchAutoZoom, DiagramCommand.ToggleAutoZoom, DiagramCommand.AutoZoomToContent, DiagramCommand.AutoZoomToWidth ];
export class ViewController implements IViewController, ICanvasViewListener, IZoomChangesListener {
    private view: ICanvasViewManager;
    private autoZoom: AutoZoomMode;
    constructor(protected settings: DiagramSettings, protected bars: IBarManager) {
        settings.onZoomChanged.add(this);
        this.autoZoom = settings.autoZoom;
    }
    initialize(view: ICanvasViewManager) {
        this.view = view;
        this.view.onViewChanged.add(this);
    }
    scrollTo(modelPoint: Point, offsetPoint: Point) {
        if(this.view)
            this.view.setScrollTo(modelPoint, offsetPoint);
    }
    scrollBy(offset: Point): Point {
        if(this.view && (offset.x !== 0 || offset.y !== 0))
            return this.view.scrollBy(offset);
        return offset;
    }
    scrollIntoView(rectangle: Rectangle) {
        this.view && this.view.scrollIntoView(rectangle);
    }
    normalize() {
        this.view.tryNormalizePaddings();
    }
    getNextStepZoom(increase: boolean): number {
        const currentZoomStep = this.getNearestCurrentZoomStep();
        const delta = increase ? 1 : -1;
        const step = Math.min(ZOOM_STEPS - 1, Math.max(0, currentZoomStep + delta));
        if(step !== ZERO_STEP) {
            const logZoom = LOG_MIN_ZOOM + (LOG_MAX_ZOOM - LOG_MIN_ZOOM) * step / (ZOOM_STEPS - 1);
            return Math.exp(logZoom);
        }
        return 1;
    }
    private getNearestCurrentZoomStep(): number {
        const zoom = this.getZoom();
        return getStepByZoom(zoom);
    }
    getZoom(): number {
        return this.view ? this.view.actualZoom : this.settings.zoomLevel;
    }
    resetScroll() {
        this.view.adjust({ horizontal: true, vertical: true });
    }

    notifyViewAdjusted(canvasOffset: Point) { }
    notifyActualZoomChanged(actualZoom: number) {
        this.bars.updateItemsState(ZOOMLEVEL_COMMANDS);
    }
    notifyZoomChanged(fixedZoomLevel: number, autoZoom: AutoZoomMode) {
        if(this.autoZoom !== autoZoom) {
            this.autoZoom = autoZoom;
            this.bars.updateItemsState(AUTOZOOM_COMMANDS);
        }
    }
}

function getStepByZoom(zoom: number): number {
    const logZoom = Math.log(zoom);
    return Math.round((logZoom - LOG_MIN_ZOOM) * (ZOOM_STEPS - 1) / (LOG_MAX_ZOOM - LOG_MIN_ZOOM));
}

export interface IViewController {
    scrollTo(modelPoint: Point, offsetPoint: Point);
    normalize();
    scrollBy(offset: Point): Point;
    getNextStepZoom(increase: boolean): number;
    getZoom(): number;
    resetScroll();
    scrollIntoView(rectangle: Rectangle);
}
