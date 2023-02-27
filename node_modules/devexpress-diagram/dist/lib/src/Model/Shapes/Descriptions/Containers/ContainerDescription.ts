import { ShapeDescription, ShapeDefaultDimension } from "../ShapeDescription";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { ShapeTypes } from "../../ShapeTypes";
import { Shape } from "../../Shape";
import { SvgPrimitive } from "../../../../Render/Primitives/Primitive";
import { RectanglePrimitive } from "../../../../Render/Primitives/RectaglePrimitive";
import { PathPrimitive, PathPrimitiveMoveToCommand, PathPrimitiveLineToCommand } from "../../../../Render/Primitives/PathPrimitive";
import { RenderUtils } from "../../../../Render/Utils";
import { MouseEventElementType } from "../../../../Events/Event";
import { GroupPrimitive } from "../../../../Render/Primitives/GroupPrimitive";
import { ConnectionPoint } from "../../../ConnectionPoint";
import { ConnectionPointSide, DiagramItem } from "../../../DiagramItem";
import { DiagramLocalizationService } from "../../../../LocalizationService";

export const CONTAINER_HEADER_SIZE = 360;
export const CONTAINER_HEADER_TOOLBOX_SIZE_RATIO = 0.2;
export const CONTAINER_EXPAND_BUTTON_RECT_RATIO = 0.5;
export const CONTAINER_EXPAND_BUTTON_SIGN_RATIO = 0.3;

export abstract class ContainerDescription extends ShapeDescription {
    constructor(defaultSize: Size = new Size(ShapeDefaultDimension * 2, ShapeDefaultDimension * 1.5)) {
        super(defaultSize, true);
    }

    get enableChildren() { return true; }
    get keepRatioOnAutoSize() { return false; }

    getDefaultText() {
        return DiagramLocalizationService.shapeTexts[ShapeTypes.Container];
    }
    protected createConnectionPoints(): ConnectionPoint[] {
        return [
            new ConnectionPoint(0.25, 0, ConnectionPointSide.North),
            new ConnectionPoint(0.5, 0, ConnectionPointSide.North),
            new ConnectionPoint(0.75, 0, ConnectionPointSide.North),
            new ConnectionPoint(1, 0.25, ConnectionPointSide.East),
            new ConnectionPoint(1, 0.5, ConnectionPointSide.East),
            new ConnectionPoint(1, 0.75, ConnectionPointSide.East),
            new ConnectionPoint(0.75, 1, ConnectionPointSide.South),
            new ConnectionPoint(0.5, 1, ConnectionPointSide.South),
            new ConnectionPoint(0.25, 1, ConnectionPointSide.South),
            new ConnectionPoint(0, 0.75, ConnectionPointSide.West),
            new ConnectionPoint(0, 0.5, ConnectionPointSide.West),
            new ConnectionPoint(0, 0.25, ConnectionPointSide.West)
        ];
    }
    getConnectionPointIndexForItem(item: DiagramItem, connectionPointIndex: number): number {
        const shapeConnectionPoints = item && item.getConnectionPoints();
        if(shapeConnectionPoints.length === 4)
            return connectionPointIndex * 3 + 1;
        return connectionPointIndex;
    }
    getConnectionPointIndexForSide(side: ConnectionPointSide): number {
        return side * 3 + 1;
    }
    createShapePrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[] {
        const { x: left, y: top, width, height } = shape.rectangle;

        let primitives: SvgPrimitive<SVGGraphicsElement>[] = [];
        if(shape.expanded)
            primitives = primitives.concat([
                new RectanglePrimitive(left, top, width, height, shape.style)
            ]);

        return primitives.concat(this.createHeaderPrimitives(shape, forToolbox));
    }

    abstract createHeaderPrimitives(shape: Shape, forToolbox?: boolean): SvgPrimitive<SVGGraphicsElement>[];

    createExpandButtonPrimitives(shape: Shape, rect: Rectangle): SvgPrimitive<SVGGraphicsElement>[] {
        let commands = [
            new PathPrimitiveMoveToCommand(
                rect.x + rect.width * ((1 - CONTAINER_EXPAND_BUTTON_SIGN_RATIO) / 2),
                rect.center.y
            ),
            new PathPrimitiveLineToCommand(
                rect.x + rect.width * ((1 - CONTAINER_EXPAND_BUTTON_SIGN_RATIO) / 2 + CONTAINER_EXPAND_BUTTON_SIGN_RATIO),
                rect.center.y
            )
        ];
        if(!shape.expanded)
            commands = commands.concat([
                new PathPrimitiveMoveToCommand(
                    rect.center.x,
                    rect.y + rect.height * ((1 - CONTAINER_EXPAND_BUTTON_SIGN_RATIO) / 2)
                ),
                new PathPrimitiveLineToCommand(
                    rect.center.x,
                    rect.y + rect.height * ((1 - CONTAINER_EXPAND_BUTTON_SIGN_RATIO) / 2 + CONTAINER_EXPAND_BUTTON_SIGN_RATIO)
                ),
            ]);

        const buttonRect = rect.clone().inflate(
            -rect.width * (1 - CONTAINER_EXPAND_BUTTON_RECT_RATIO) / 2,
            -rect.height * (1 - CONTAINER_EXPAND_BUTTON_RECT_RATIO) / 2
        );
        return [
            new GroupPrimitive([
                new RectanglePrimitive(buttonRect.x, buttonRect.y, buttonRect.width, buttonRect.height, shape.style),
                new PathPrimitive(commands, shape.style)
            ], "shape-expand-btn", null, null, el => {
                RenderUtils.setElementEventData(el, MouseEventElementType.ShapeExpandButton, shape.key);
            })
        ];
    }
}
