import { GeometryUtils } from "../../Utils";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { PathPrimitiveCommand, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand, PathPrimitive } from "../../Render/Primitives/PathPrimitive";
import { Style } from "../Style";

export class ConnectorLineEndingStrategy {
    constructor(protected style: Style) {
    }

    hasCommands() {
        return true;
    }
    needCreateSeparatePrimitive() {
        return false;
    }
    createPrimitive(): PathPrimitive {
        return new PathPrimitive([], this.getStyle(), this.getCssClass());
    }
    createCommands(point: Point, directionPoint: Point): PathPrimitiveCommand[] {
        return [];
    }
    protected getStyle() {
        const style = <Style> this.style.clone();
        style.resetStrokeDashArray();
        return style;
    }
    protected getCssClass() {
        return undefined;
    }
}

export class ConnectorLineEndingNoneStrategy extends ConnectorLineEndingStrategy {
    hasCommands() {
        return false;
    }
}

export class ConnectorLineEndingArrowStrategy extends ConnectorLineEndingStrategy {
    get arrowHeight(): number { return this.style.strokeWidth * 6; }
    get arrowWidth(): number { return this.style.strokeWidth * 2; }

    needCreateSeparatePrimitive() {
        return !this.style.isDefaultStrokeDashArray();
    }
    createCommands(point: Point, directionPoint: Point): PathPrimitiveCommand[] {
        const arrowPoints = this.getArrowPoints(point, directionPoint);
        let commands = [
            new PathPrimitiveMoveToCommand(arrowPoints.point1.x, arrowPoints.point1.y),
            new PathPrimitiveLineToCommand(point.x, point.y),
            new PathPrimitiveLineToCommand(arrowPoints.point2.x, arrowPoints.point2.y)
        ];
        if(!this.style.isDefaultStrokeDashArray())
            commands = commands.concat([
                new PathPrimitiveMoveToCommand(point.x, point.y),
                new PathPrimitiveLineToCommand(arrowPoints.point3.x, arrowPoints.point3.y)
            ]);

        return commands;

    }
    protected getArrowPoints(point: Point, directionPoint: Point) {
        let arrowHeight = this.arrowHeight;
        if(point.x === directionPoint.x) {
            const distance = Math.abs(point.y - directionPoint.y);
            if(distance < arrowHeight)
                arrowHeight = distance;
        }
        if(point.y === directionPoint.y) {
            const distance = Math.abs(point.x - directionPoint.x);
            if(distance < arrowHeight)
                arrowHeight = distance;
        }
        return GeometryUtils.getArrowPoints(point, directionPoint, arrowHeight, this.arrowWidth);
    }
}

export class ConnectorLineEndingOutlinedTriangleStrategy extends ConnectorLineEndingArrowStrategy {
    needCreateSeparatePrimitive() {
        return true;
    }
    createCommands(point: Point, directionPoint: Point): PathPrimitiveCommand[] {
        const arrowPoints = this.getArrowPoints(point, directionPoint);
        return [
            new PathPrimitiveMoveToCommand(arrowPoints.point1.x, arrowPoints.point1.y),
            new PathPrimitiveLineToCommand(point.x, point.y),
            new PathPrimitiveLineToCommand(arrowPoints.point2.x, arrowPoints.point2.y),
            new PathPrimitiveClosePathCommand()
        ];
    }
    protected getCssClass() {
        return "outlined-line-ending";
    }
}

export class ConnectorLineEndingFilledTriangleStrategy extends ConnectorLineEndingOutlinedTriangleStrategy {
    protected getStyle() {
        const style = super.getStyle();
        style["fill"] = style["stroke"];
        return style;
    }
    protected getCssClass() {
        return "filled-line-ending";
    }
}
