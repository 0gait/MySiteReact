import { GridElementInfo } from "../Helpers/GridElementInfo";
import { GridLayoutCalculator } from "../Helpers/GridLayoutCalculator";
import { StripLineSettings } from "../Settings/StripLineSettings";
import { RenderElementUtils } from "./RenderElementUtils";
import { RenderHelper } from "./RenderHelper";

export class StripLinesRender {
    private _renderHelper: RenderHelper;
    private _stripLinesMap: Array<Array<GridElementInfo>> = [];
    private _renderedStripLines: Array<GridElementInfo> = [];

    constructor(renderHelepr: RenderHelper) {
        this._renderHelper = renderHelepr;
    }

    protected get gridLayoutCalculator(): GridLayoutCalculator {
        return this._renderHelper.gridLayoutCalculator;
    }

    protected get taskArea(): HTMLElement {
        return this._renderHelper.taskArea;
    }

    public get stripLinesMap(): GridElementInfo[][] {
        return this._stripLinesMap;
    }

    protected get renderedStripLines(): GridElementInfo[] {
        return this._renderedStripLines;
    }
    protected set renderedStripLines(renderedStripLines: GridElementInfo[]) {
        this._renderedStripLines = renderedStripLines;
    }

    protected get stripLines(): StripLineSettings {
        return this._renderHelper.stripLines;
    }

    reset(): void {
        this._renderedStripLines = [];
    }

    recreateStripLines(): void {
        const newRenderedStripLines = this.gridLayoutCalculator.getRenderedStripLines(this.stripLines);
        RenderElementUtils.recreate(
            this.renderedStripLines, newRenderedStripLines,
            info => { RenderElementUtils.remove(info, null, this.taskArea, this.stripLinesMap); },
            info => { return RenderElementUtils.create(info, null, this.taskArea, this.stripLinesMap); }
        );
        this.renderedStripLines = newRenderedStripLines;
    }
}
