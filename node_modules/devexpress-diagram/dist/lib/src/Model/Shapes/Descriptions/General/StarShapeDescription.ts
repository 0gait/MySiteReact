import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { Shape } from "../../Shape";
import { PathPrimitive, PathPrimitiveLineToCommand, PathPrimitiveMoveToCommand, PathPrimitiveClosePathCommand } from "../../../../Render/Primitives/PathPrimitive";
import { ShapeTypes } from "../../ShapeTypes";
import { PentagonShapeDescription } from "./PentagonShapeDescription";
import { ShapeParameters, ShapeParameter } from "../../ShapeParameters";
import { ShapeParameterPoint } from "../../ShapeParameterPoint";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ConnectionPointSide } from "../../../DiagramItem";
import { ConnectionPoint } from "../../../ConnectionPoint";

export const StarConvexParameterName = "sc";

export class StarShapeDescription extends PentagonShapeDescription {
    get key() { return ShapeTypes.Star; }

    createShapePrimitives(shape: Shape): SvgPrimitive<SVGGraphicsElement>[] {
        const rect = shape.rectangle;
        const { x: left, y: top, right, width, height } = rect;
        const bottom = this.getActualBottom(top, rect.bottom, width, height);
        const cx = rect.center.x;
        const cy = top + (bottom - top) / 2;
        const ratio = height / width;
        const angle = Math.PI - this.angle;
        const py = width / 2 * Math.tan(angle / 2) * ratio;
        const y = top + py;
        const px = (height - py) / Math.tan(angle) / ratio;
        const x1 = left + px;
        const x2 = right - px;

        const pDistance = shape.parameters.get(StarConvexParameterName).value;
        const distance = this.getInnerPointDistance(cx, cx, right, cy, top, y);

        return [
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(cx, top),
                new PathPrimitiveLineToCommand(
                    this.getInnerPointPos(cx, cx, right, pDistance, distance),
                    this.getInnerPointPos(cy, top, y, pDistance, distance)
                ),
                new PathPrimitiveLineToCommand(right, y),
                new PathPrimitiveLineToCommand(
                    this.getInnerPointPos(cx, right, x2, pDistance, distance),
                    this.getInnerPointPos(cy, y, bottom, pDistance, distance)
                ),
                new PathPrimitiveLineToCommand(x2, bottom),
                new PathPrimitiveLineToCommand(
                    this.getInnerPointPos(cx, x2, x1, pDistance, distance),
                    this.getInnerPointPos(cy, bottom, bottom, pDistance, distance)
                ),
                new PathPrimitiveLineToCommand(x1, bottom),
                new PathPrimitiveLineToCommand(
                    this.getInnerPointPos(cx, x1, left, pDistance, distance),
                    this.getInnerPointPos(cy, bottom, y, pDistance, distance)
                ),
                new PathPrimitiveLineToCommand(left, y),
                new PathPrimitiveLineToCommand(
                    this.getInnerPointPos(cx, left, cx, pDistance, distance),
                    this.getInnerPointPos(cy, y, top, pDistance, distance)
                ),
                new PathPrimitiveClosePathCommand()
            ], shape.style)
        ];
    }
    createParameters(parameters: ShapeParameters) {
        parameters.addRange([
            new ShapeParameter(StarConvexParameterName, 300)
        ]);
    }
    normalizeParameters(shape: Shape, parameters: ShapeParameters) {
        const rect = shape.rectangle;
        const { y: top, right, width, height } = rect;
        const bottom = this.getActualBottom(top, rect.bottom, width, height);
        const cx = rect.center.x;
        const cy = top + (bottom - top) / 2;
        const ratio = height / width;
        const angle = Math.PI - this.angle;
        const py = width / 2 * Math.tan(angle / 2) * ratio;
        const y = top + py;

        const distance = this.getInnerPointDistance(cx, cx, right, cy, top, y);

        this.changeParameterValue(parameters, StarConvexParameterName,
            p => Math.max(0, Math.min(distance, p.value)));
    }
    modifyParameters(shape: Shape, parameters: ShapeParameters, deltaX: number, deltaY: number) {
        let distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        if(deltaX < 0 || deltaY > 0) distance = -distance;
        this.changeParameterValue(parameters, StarConvexParameterName, p => p.value + distance);
        this.normalizeParameters(shape, parameters);
    }
    getParameterPoints(shape: Shape): ShapeParameterPoint[] {
        const rect = shape.rectangle;
        const { y: top, right, width, height } = rect;
        const bottom = this.getActualBottom(top, rect.bottom, width, height);
        const cx = rect.center.x;
        const cy = top + (bottom - top) / 2;
        const ratio = height / width;
        const angle = Math.PI - this.angle;
        const py = width / 2 * Math.tan(angle / 2) * ratio;
        const y = top + py;

        const pDistance = shape.parameters.get(StarConvexParameterName).value;
        const distance = this.getInnerPointDistance(cx, cx, right, cy, top, y);

        const innerPointX = this.getInnerPointPos(cx, cx, right, pDistance, distance);
        const innerPointY = this.getInnerPointPos(cy, top, y, pDistance, distance);
        return [
            new ShapeParameterPoint("c", new Point(innerPointX, innerPointY))
        ];
    }
    processConnectionPoint(shape: Shape, point: ConnectionPoint) {
        super.processConnectionPoint(shape, point);

        const side = shape.getConnectionPointSide(point);
        if(side === ConnectionPointSide.South) {
            const rect = shape.rectangle;
            const { y: top, right, width, height } = rect;
            const bottom = this.getActualBottom(top, rect.bottom, width, height);
            const cx = rect.center.x;
            const cy = top + (bottom - top) / 2;
            const ratio = height / width;
            const angle = Math.PI - this.angle;
            const py = width / 2 * Math.tan(angle / 2) * ratio;
            const y = top + py;

            const pDistance = shape.parameters.get(StarConvexParameterName).value;
            const distance = this.getInnerPointDistance(cx, cx, right, cy, top, y);

            point.y = this.getInnerPointPos(cy, bottom, bottom, pDistance, distance);
        }
    }

    getInnerPointDistanceByAxis(center: number, edge1: number, edge2: number): number {
        const edgeX = Math.min(edge1, edge2) + Math.abs(edge1 - edge2) / 2;
        return edgeX - center;
    }
    getInnerPointPos(center: number, edge1: number, edge2: number, pDistance: number, distance: number): number {
        const ratio = Math.min(1, pDistance / distance);
        return center + this.getInnerPointDistanceByAxis(center, edge1, edge2) * ratio;
    }
    getInnerPointDistance(centerX: number, edgeX1: number, edgeX2: number, centerY: number, edgeY1: number, edgeY2: number) {
        const disX = this.getInnerPointDistanceByAxis(centerX, edgeX1, edgeX2);
        const disY = this.getInnerPointDistanceByAxis(centerY, edgeY1, edgeY2);
        return Math.sqrt(Math.pow(disX, 2) + Math.pow(disY, 2));
    }
    getActualBottom(top, bottom, width, height) {
        const result = top + super.calculateHeight(width) * height / width;
        return result < bottom ? result : bottom;
    }
    calculateHeight(width: number): number {
        return width;
    }
}
