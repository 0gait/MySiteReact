import { ICanvasViewListener } from "./CanvasViewManager";
import { EventDispatcher } from "../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Point } from "@devexpress/utils/lib/geometry/point";

export interface ICanvasViewManager {
    onViewChanged: EventDispatcher<ICanvasViewListener>;
    setScrollTo(modelPoint: Point, offsetPoint?: Point);
    tryNormalizePaddings();
    scrollBy(offset: Point);
    actualZoom: number;
    adjust(resetPaddings?: OrientationInfo);
    scrollIntoView(rectangle: Rectangle);
}

export declare type OrientationInfo = {
    horizontal: boolean,
    vertical: boolean
}
