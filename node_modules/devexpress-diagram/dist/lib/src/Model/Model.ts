import { Shape } from "./Shapes/Shape";
import { Connector } from "./Connectors/Connector";
import { DiagramItem, ItemKey, ItemDataKey } from "./DiagramItem";
import { GeometryUtils } from "../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ImageCache } from "../Images/ImageCache";
import { ImageLoader } from "../Images/ImageLoader";
import { ColorUtils } from "@devexpress/utils/lib/utils/color";
import { ShapeDescription } from "./Shapes/Descriptions/ShapeDescription";
import { DiagramUnit } from "../Enums";
import { ModelUtils } from "./ModelUtils";

export class DiagramModel {
    items: DiagramItem[] = [];
    private rectangle: Rectangle;
    private itemIndexByKey: {[key: string]: number} = {};
    private keyCounter: number = 0;

    static defaultPageColor: number = ColorUtils.LIGHT_COLOR;

    pageSize: Size = new Size(8391, 11906);
    pageLandscape: boolean = false;
    pageColor: number = DiagramModel.defaultPageColor;
    size: Size;
    units: DiagramUnit = DiagramUnit.In;

    snapStartPoint = new Point(0, 0);

    constructor(pageSize: Size = new Size(8391, 11906)) {
        this.pageSize = pageSize;
        this.size = this.pageSize.clone();
        this.rectangle = Rectangle.fromGeometry(new Point(0, 0), new Size(0, 0));

        this.initializeKeyCounter();
    }

    get pageWidth() {
        return this.pageLandscape ? this.pageSize.height : this.pageSize.width;
    }
    get pageHeight() {
        return this.pageLandscape ? this.pageSize.width : this.pageSize.height;
    }

    getRectangle(forceUpdate: boolean) {
        if(forceUpdate)
            this.rectangle = ModelUtils.createRectangle(this.items);
        return this.rectangle;
    }
    pushItem(item: DiagramItem) {
        const index = this.items.push(item);
        this.itemIndexByKey[item.key] = index - 1;
        if(item instanceof Shape && !item.image.isEmpty)
            this.cacheShapeImage(item);
    }
    removeItem(item: DiagramItem) {
        const index = this.getItemIndex(item);
        delete this.itemIndexByKey[item.key];
        this.items.splice(index, 1);
        this.updateIndicesHash(index);
    }
    private updateIndicesHash(startIndex: number) {
        for(let i = startIndex; i < this.items.length; i++)
            this.itemIndexByKey[this.items[i].key] = i;
    }
    getItemIndex(item: DiagramItem): number {
        return this.itemIndexByKey[item.key];
    }
    findShape(key: ItemKey): Shape {
        const shape = this.findItem(key);
        return shape instanceof Shape ? shape : undefined;
    }
    private findShapesCore(callback: (shape: Shape) => boolean): Shape[] {
        const shapes: Shape[] = [];
        this.items.forEach(item => {
            if(item instanceof Shape)
                if(callback(item)) {
                    shapes.push(item);
                    return;
                }

        });
        return shapes;
    }
    private findShapeCore(callback: (shape: Shape) => boolean): Shape {
        for(let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if(item instanceof Shape)
                if(callback(item))
                    return item;

        }
    }
    findShapeAtPosition(position: Point): Shape {
        return this.findShapeCore(shape => shape.position.equals(position));
    }
    findShapeByDataKey(key: ItemDataKey): Shape {
        return this.findShapeCore(shape => shape.dataKey === key);
    }
    findShapesByImageUrl(imageUrl: string): Shape[] {
        return this.findShapesCore(shape => shape.image.url === imageUrl);
    }
    findShapesByDescription(description: ShapeDescription): Shape[] {
        return this.findShapesCore(shape => shape.description.key === description.key);
    }
    cacheShapeImage(shape: Shape) {
        const cacheImageInfo = ImageCache.instance.createUnloadedInfoByShapeImageInfo(shape.image);
        if(cacheImageInfo.isLoaded)
            shape.image.loadBase64Content(cacheImageInfo.base64);
    }
    loadAllImages(imageLoader: ImageLoader) {
        ImageCache.instance.loadAllImages(imageLoader);
    }
    findContainer(key: ItemKey): Shape {
        const shape = this.findShape(key);
        return shape && shape.enableChildren ? shape : undefined;
    }
    findNearestContainer(key: ItemKey): Shape {
        const shape = this.findShape(key);
        if(shape)
            return shape.enableChildren ? shape : shape.container;
        else
            return undefined;
    }
    getChildren(container: Shape): DiagramItem[] {
        return container.children.map(child => this.findItem(child.key)).filter(item => item);
    }
    findChild(container: Shape, key: ItemKey, recursive: boolean = true): DiagramItem {
        let result: DiagramItem;
        container.children.forEach(child => {
            if(result) return;

            if(child.key === key) {
                result = child;
                return;
            }
            if(recursive && child instanceof Shape) {
                result = this.findChild(child, key, recursive);
                if(result)
                    return;
            }
        });
        return result;
    }
    findItemContainerCore(item: DiagramItem, callback?: (shape: Shape) => boolean): Shape {
        let container = item.container;
        while(container) {
            if(!callback || callback(container))
                break;
            container = container.container;
        }
        return container;
    }
    findItemContainer(item: DiagramItem): Shape {
        return this.findItemContainerCore(item);
    }
    findItemCollapsedContainer(item: DiagramItem): Shape {
        return this.findItemContainerCore(item, c => !c.expanded);
    }
    findItemTopCollapsedContainer(item: DiagramItem): Shape {
        let container = item.container;
        let collapsedContainer: Shape;
        while(container) {
            if(!container.expanded)
                collapsedContainer = container;
            container = container.container;
        }
        return collapsedContainer;
    }
    isContainerItem(container: Shape, item: DiagramItem): boolean {
        return this.findItemContainerCore(item, c => c.key === container.key) !== undefined;
    }
    findConnector(key: ItemKey): Connector {
        const connector = this.findItem(key);
        return connector instanceof Connector ? connector : undefined;
    }
    private findConnectorCore(callback: (connector: Connector) => boolean): Connector {
        for(let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            if(item instanceof Connector)
                if(callback(item))
                    return item;

        }
    }
    findConnectorAtPoints(points: Point[]): Connector {
        return this.findConnectorCore(connector => GeometryUtils.arePointsEqual(connector.points, points));
    }
    findConnectorByDataKey(key: ItemDataKey): Connector {
        return this.findConnectorCore(connector => connector.dataKey === key);
    }
    findConnectorByBeginEndDataKeys(beginDataKey: ItemDataKey, endDataKey: ItemDataKey): Connector {

        return this.findConnectorCore(connector => (connector.beginItem && connector.beginItem.dataKey === beginDataKey) &&
            (connector.endItem && connector.endItem.dataKey === endDataKey));

    }
    findConnectorsCore(callback: (connector: Connector) => boolean): Connector[] {
        const result: Connector[] = [];
        this.items.forEach(item => {
            if(item instanceof Connector)
                if(callback(item)) {
                    result.push(item);
                    return;
                }

        });
        return result;
    }
    findConnectorsWithoutBeginItem(): Connector[] {
        return this.findConnectorsCore(connector => !connector.beginItem);
    }
    findConnectorsWithoutEndItem(): Connector[] {
        return this.findConnectorsCore(connector => !connector.endItem);
    }
    findItem(key: ItemKey): DiagramItem {
        return this.items[this.itemIndexByKey[key]];
    }

    findItemByDataKey(key: ItemDataKey): DiagramItem {
        return this.findItemCore(item => item.dataKey === key);
    }
    private findItemCore(callback: (item: DiagramItem) => boolean): DiagramItem {
        for(let i = 0; i < this.items.length; i++)
            if(callback(this.items[i]))
                return this.items[i];

    }

    static isIntersectedItems(item1: DiagramItem, item2: DiagramItem): boolean {
        let result = false;
        if(item1 instanceof Shape)
            result = item2.intersectedByRect(item1.rectangle);
        else if(item1 instanceof Connector)
            item1.getSegments().forEach(s1 => {
                if(item2 instanceof Shape)
                    result = result || s1.isIntersectedByRect(item2.rectangle);
                else if(item2 instanceof Connector)
                    item2.getSegments().forEach(s2 => {
                        result = result || s1.isIntersected(s2);
                    });

            });

        return result;
    }
    getIntersectItems(item: DiagramItem): DiagramItem[] {
        const result = [];
        this.items.forEach(i => {
            if(i.container !== item.container)
                return;
            if(item !== i && (!(i instanceof Connector) || item.attachedConnectors.indexOf(i) === -1) &&
                DiagramModel.isIntersectedItems(i, item))
                result.push(i);
        });
        return result;
    }
    getIntersectItemsMinZIndex(item: DiagramItem): number {
        const items = this.getIntersectItems(item);
        return items.map(i => i.zIndex).reduce((prev, cur) => Math.min(prev, cur), Number.MAX_VALUE);
    }
    getIntersectItemsMaxZIndex(item: DiagramItem): number {
        const items = this.getIntersectItems(item);
        return items.map(i => i.zIndex).reduce((prev, cur) => Math.max(prev, cur), -Number.MAX_VALUE);
    }
    iterateItems(callback: (item: DiagramItem) => void): void {
        this.items.forEach(callback);
    }
    getNextKey(): ItemKey {
        return (this.keyCounter++).toString();
    }
    initializeKeyCounter(): void {
        this.keyCounter = this.items.reduce((prev, cur) => {
            const num = parseInt(cur.key);
            return Math.max(prev, isNaN(num) ? 0 : num + 1);
        }, this.items.length);
    }
}
