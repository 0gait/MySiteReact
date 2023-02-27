import { svgNS } from "../RenderHelper";
import { SvgPrimitive } from "./Primitive";
import { Style } from "../../Model/Style";
import { ITextMeasurer } from "../Measurer/ITextMeasurer";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { PrimitiveObject } from "./PrimitiveObject";

export class PathPrimitive extends SvgPrimitive<SVGPathElement> {
    public commands: PathPrimitiveCommand[];

    constructor(
        commands: PathPrimitiveCommand[],
        style?: Style,
        className?: string,
        clipPathId?: string,
        onApplyProperties?: (SVGElement) => void) {
        super(style, className, clipPathId, onApplyProperties);

        this.commands = commands.map(command => {
            command.style = style;
            return command;
        });
    }

    protected createMainElement(): SVGPathElement {
        return document.createElementNS(svgNS, "path");
    }
    applyElementProperties(element: SVGPathElement, measurer: ITextMeasurer) {
        element.setAttribute("d", this.commands.map(c => c.toString()).join(" "));
        this.setPositionCorrectionAttribute(element);

        super.applyElementProperties(element, measurer);
    }
}

export abstract class PathPrimitiveCommand extends PrimitiveObject {
    abstract toString(): string;
}

export class PathPrimitiveMoveToCommand extends PathPrimitiveCommand {
    constructor(public x: number | string, public y: number | string) {
        super();
    }
    toString(): string {
        return "M " + this.getUnitVaue(this.x) + " " + this.getUnitVaue(this.y);
    }
    static fromPoint(point: Point) {
        return new PathPrimitiveMoveToCommand(point.x, point.y);
    }
}

export class PathPrimitiveLineToCommand extends PathPrimitiveCommand {
    constructor(public x: number | string, public y: number | string) {
        super();
    }
    toString(): string {
        return "L " + this.getUnitVaue(this.x) + " " + this.getUnitVaue(this.y);
    }
    static fromPoint(point: Point) {
        return new PathPrimitiveLineToCommand(point.x, point.y);
    }
}

export class PathPrimitiveCubicCurveToCommand extends PathPrimitiveCommand {
    constructor(public x1: number | string, public y1: number | string,
        public x2: number | string, public y2: number | string,
        public x3: number | string, public y3: number | string) {
        super();
    }
    toString(): string {
        return "C " + this.getUnitVaue(this.x1) + " " + this.getUnitVaue(this.y1) + "," +
            this.getUnitVaue(this.x2) + " " + this.getUnitVaue(this.y2) + "," +
            this.getUnitVaue(this.x3) + " " + this.getUnitVaue(this.y3);
    }
}

export class PathPrimitiveQuadraticCurveToCommand extends PathPrimitiveCommand {
    constructor(public x1: number | string, public y1: number | string,
        public x2: number | string, public y2: number | string) {
        super();
    }
    toString(): string {
        return "Q " + this.getUnitVaue(this.x1) + " " + this.getUnitVaue(this.y1) + "," +
            this.getUnitVaue(this.x2) + " " + this.getUnitVaue(this.y2);
    }
}

export class PathPrimitiveArcToCommand extends PathPrimitiveCommand {
    constructor(public rx: number | string, public ry: number | string, public xAxisRotation: number | string,
        public largeArcFlag: boolean, public sweepFag: boolean,
        public x: number | string, public y: number | string) {
        super();
    }
    toString(): string {
        return "A " + this.getUnitVaue(this.rx) + " " + this.getUnitVaue(this.ry) + " " +
            this.getUnitVaue(this.xAxisRotation) + " " +
            (this.largeArcFlag ? "1" : "0") + " " + (this.sweepFag ? "1" : "0") +
            this.getUnitVaue(this.x) + "," + this.getUnitVaue(this.y);
    }
}

export class PathPrimitiveClosePathCommand extends PathPrimitiveCommand {
    constructor() {
        super();
    }
    toString(): string {
        return "z";
    }
}
