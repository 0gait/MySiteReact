import { EllipsePrimitive } from "./Primitives/EllipsePrimitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveArcToCommand, PathPrimitiveCubicCurveToCommand, PathPrimitiveLineToCommand, PathPrimitiveClosePathCommand } from "./Primitives/PathPrimitive";
import { GroupPrimitive } from "./Primitives/GroupPrimitive";
import { Browser } from "@devexpress/utils/lib/browser";
import { RectanglePrimitive } from "./Primitives/RectaglePrimitive";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";

export class ShapeImageIndicator {
    private animationRequestId: number;
    private animationStarted: boolean = false;
    private constructor(
        public x: number,
        public y: number,
        public size: number,
        public borderThickness: number,
        public className?: string) { }

    public static createLoadingIndicatorPrimitives(x: number, y: number, r: number, borderThickness: number, className?: string): GroupPrimitive {
        const indicator = new ShapeImageIndicator(x, y, r, borderThickness, className);
        return indicator.createLoadingIndicatorPrimitive();
    }

    public static createUserIconPrimitives(x: number, y: number, r: number, borderThickness: number, className?: string): GroupPrimitive {
        const indicator = new ShapeImageIndicator(x, y, r, borderThickness, className);
        return indicator.createUserIconPrimitive();
    }

    public static createWarningIconPrimitives(x: number, y: number, size: number, className?: string): GroupPrimitive {
        const indicator = new ShapeImageIndicator(x, y, size, undefined, className);
        return indicator.createWarningIconPrimitive();
    }

    protected rotate(element: SVGElement, centerX: number, centerY: number, timestamp: number) {
        if(!this.animationStarted)
            return;
        const angle = (Math.round(timestamp) % 1080) / 3;
        const transformAttributeValue = "rotate(" + angle + " " + centerX + " " + centerY + ")";
        element.setAttribute("transform", transformAttributeValue);
        this.animationRequestId = requestAnimationFrame(function(timestamp) {
            this.rotate(element, centerX, centerY, timestamp);
        }.bind(this));
    }
    protected onApplyLoadingIndicatorElementProperties(element: SVGElement) {
        const [ centerX, centerY ] = [UnitConverter.twipsToPixelsF(this.x + this.size / 2), UnitConverter.twipsToPixelsF(this.y + this.size / 2)];
        if(Browser.IE) {
            this.animationRequestId = requestAnimationFrame(function(timestamp) {
                this.rotate(element, centerX, centerY, timestamp);
            }.bind(this));
            this.animationStarted = true;
        }
        else
            element.style.setProperty("transform-origin", centerX + "px " + centerY + "px");

    }
    private center() {
        return [UnitConverter.twipsToPixelsF(this.x + this.size / 2), UnitConverter.twipsToPixelsF(this.y + this.size / 2)];
    }
    protected createLoadingIndicatorPrimitive(): GroupPrimitive {
        const [centerX, centerY] = this.center();
        const radius = UnitConverter.twipsToPixelsF(this.size / 2 - this.borderThickness / 2);
        return new GroupPrimitive([
            new EllipsePrimitive(centerX + "", centerY + "", radius + "", radius + ""),
            new PathPrimitive([
                new PathPrimitiveMoveToCommand((centerX + radius) + "", centerY + ""),
                new PathPrimitiveArcToCommand(radius + "", radius + "",
                    0, false, false, centerX + "", (centerY - radius) + "")
            ])
        ], this.className, undefined, undefined, this.onApplyLoadingIndicatorElementProperties.bind(this), this.onBeforeDispose.bind(this));
    }
    protected createUserIconPrimitive(): GroupPrimitive {
        const [centerX, centerY] = this.center();
        const radius = UnitConverter.twipsToPixelsF(this.size / 2 - this.borderThickness / 2);
        const sizeInPixels = UnitConverter.twipsToPixelsF(this.size);
        return new GroupPrimitive([
            new EllipsePrimitive(centerX + "", centerY + "", radius + "", radius + "", undefined, "dxdi-background"),
            new EllipsePrimitive(centerX + "", centerY - sizeInPixels / 8 + "", sizeInPixels / 8 + "", sizeInPixels / 8 + ""),
            new PathPrimitive([
                new PathPrimitiveMoveToCommand(centerX + "", centerY + sizeInPixels / 16 + ""),
                new PathPrimitiveCubicCurveToCommand(centerX + 0.1375 * sizeInPixels + "", centerY + sizeInPixels / 16 + "", centerX + sizeInPixels / 4 + "", centerY
                 + 0.11875 * sizeInPixels + "", centerX + sizeInPixels / 4 + "", centerY + 0.1875 * sizeInPixels + ""),
                new PathPrimitiveLineToCommand(centerX + sizeInPixels / 4 + "", centerY + sizeInPixels / 4 + ""),
                new PathPrimitiveLineToCommand(centerX - sizeInPixels / 4 + "", centerY + sizeInPixels / 4 + ""),
                new PathPrimitiveLineToCommand(centerX - sizeInPixels / 4 + "", centerY + 0.1875 * sizeInPixels + ""),
                new PathPrimitiveCubicCurveToCommand(centerX - sizeInPixels / 4 + "", centerY + 0.11875 * sizeInPixels + "", centerX - 0.1375 * sizeInPixels + "", centerY
                 + sizeInPixels / 16 + "", centerX + "", centerY + sizeInPixels / 16 + ""),
                new PathPrimitiveClosePathCommand()
            ])
        ], this.className);
    }
    protected createWarningIconPrimitive(): GroupPrimitive {
        const [centerX, centerY] = this.center();
        const radius = UnitConverter.twipsToPixelsF(this.size / 2) - 1;
        const exclamationLineWidth = UnitConverter.twipsToPixelsF(this.size / 8);
        return new GroupPrimitive([
            new EllipsePrimitive(centerX + "", centerY + "", radius + "", radius + ""),
            new RectanglePrimitive(centerX - exclamationLineWidth / 2 + 0.5 + "", centerY + radius - UnitConverter.twipsToPixelsF(this.size / 4) + "", exclamationLineWidth + "", exclamationLineWidth + ""),
            new RectanglePrimitive(centerX - exclamationLineWidth / 2 + 0.5 + "", centerY - radius + UnitConverter.twipsToPixelsF(this.size / 4) - exclamationLineWidth + "", exclamationLineWidth + "", radius + "")
        ], this.className);
    }
    protected onBeforeDispose() {
        if(this.animationRequestId)
            cancelAnimationFrame(this.animationRequestId);
        this.animationStarted = false;
    }
}
