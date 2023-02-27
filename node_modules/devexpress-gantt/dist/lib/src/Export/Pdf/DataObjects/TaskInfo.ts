import { Point } from "@devexpress/utils/lib/geometry/point";
import { TaskTitlePosition } from "../../../View/Helpers/Enums";
import { Color } from "../Table/Color";
import { StyleDef } from "../Table/StyleDef";

export class PdfTaskInfo {
    public static defaultParentHeightCorrection = 4;

    public sidePoints: Array<Point>;
    public isMilestone: boolean;
    public isParent: boolean;
    public isSmallTask: boolean;
    public progressWidth: number;
    public text: string;
    public textPosition: TaskTitlePosition;
    public textStyle: StyleDef;
    public taskColor: Color;
    public progressColor: Color;

    public get left(): number {
        return this.sidePoints?.length > 3 ? this.sidePoints[0].x : 0;
    }
    public get top(): number {
        return this.sidePoints?.length > 3 ? this.sidePoints[1].y : 0;
    }
    public get right(): number {
        return this.sidePoints?.length > 3 ? this.sidePoints[2].x : 0;
    }
    public get bottom(): number {
        return this.sidePoints?.length > 3 ? this.sidePoints[3].y : 0;
    }
    public get width(): number { return this.right - this.left; }
    public get height(): number {
        let height = this.bottom - this.top;
        if(this.isParent)
            height -= PdfTaskInfo.defaultParentHeightCorrection;
        return height;
    }
    public assign(source: PdfTaskInfo): void {
        this.isMilestone = source.isMilestone;
        this._copyPoints(source.sidePoints);
        this.progressWidth = source.progressWidth;
        this.isSmallTask = source.isSmallTask;
        this.text = source.text;
        this.textPosition = source.textPosition;
        this.progressColor ??= new Color();
        this.progressColor.assign(source.progressColor);
        this.taskColor ??= new Color();
        this.taskColor.assign(source.taskColor);
        this.textStyle ??= new StyleDef();
        this.textStyle.assign(source.textStyle);
        this.isParent = source.isParent;
    }
    private _copyPoints(source: Array<Point>) {
        this.sidePoints = new Array<Point>();
        source?.forEach(p => this.sidePoints.push(new Point(p.x, p.y)));
    }
}
