import { Offsets } from "@devexpress/utils/lib/geometry/offsets";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { Size } from "@devexpress/utils/lib/geometry/size";

import { Diagnostics } from "../Diagnostics";
import { CacheImageInfo, ImageCache } from "../Images/ImageCache";
import { ImageInfo } from "../Images/ImageInfo";
import { ImageLoader } from "../Images/ImageLoader";
import { DiagramModelOperation } from "../ModelOperationSettings";
import { EventDispatcher, GeometryUtils, ObjectUtils } from "../Utils";
import { Connector, ConnectorPosition } from "./Connectors/Connector";
import { IConnectorRoutingModel } from "./Connectors/Routing/ConnectorRoutingModel";
import { DiagramItem, ItemKey } from "./DiagramItem";
import { DiagramModel } from "./Model";
import { ItemChange, ItemChangeType } from "./ModelChange";
import { ModelUtils } from "./ModelUtils";
import { IPermissionsProvider, PermissionsProvider } from "./Permissions/PermissionsProvider";
import { ShapeDescription } from "./Shapes/Descriptions/ShapeDescription";
import { Shape } from "./Shapes/Shape";
import { ShapeParameters } from "./Shapes/ShapeParameters";

export class ModelManipulator {
    model: DiagramModel;
    permissionsProvider: IPermissionsProvider;
    routingModel : IConnectorRoutingModel;
    imageLoader: ImageLoader;
    onModelChanged: EventDispatcher<IModelChangesListener> = new EventDispatcher();
    onModelSizeChanged: EventDispatcher<IModelSizeListener> = new EventDispatcher();

    constructor(model: DiagramModel, routingModel: IConnectorRoutingModel, permissionsProvider: PermissionsProvider) {
        this.initializeCore(model, routingModel);
        this.permissionsProvider = permissionsProvider;
        this.imageLoader = new ImageLoader(this.updateShapeImage.bind(this));
    }
    initialize(model: DiagramModel, routingModel: IConnectorRoutingModel): void {
        this.initializeCore(model, routingModel);
        this.model.loadAllImages(this.imageLoader);
        this.updateModelSize();
    }
    private initializeCore(model: DiagramModel, routingModel: IConnectorRoutingModel) {
        this.model = model;
        this.routingModel = routingModel;
        if(this.routingModel) {
            this.routingModel.initialize(model);
            model.iterateItems(item => {
                if(item instanceof Connector) {
                    const routingStrategy = this.routingModel.createStrategy(item.properties.lineOption);
                    if(routingStrategy)
                        item.changeRoutingStrategy(routingStrategy);
                    else
                        item.invalidateRenderPoints();
                }
            });
        }
    }

    commitPageChanges(): void {
        this.raisePageSizeChanged(this.model.pageSize.clone(), this.model.pageLandscape);
        this.raiseModelSizeChanged(this.model.size.clone());
        this.raisePageColorChanged(this.model.pageColor);
        this.raiseModelRectangleChanged(ModelUtils.createRectangle(this.model.items));
    }
    commitItemsCreateChanges(): void {
        Diagnostics.timer("new model: model changes");
        this.commitItemsChangesCore(ItemChangeType.Create, this.model.items);
        Diagnostics.endTimer();
    }
    commitItemUpdateChanges(item: DiagramItem): void {
        this.commitItemsChangesCore(ItemChangeType.UpdateStructure, [ item ]);
    }
    private commitItemsChangesCore(changeType: ItemChangeType, items: DiagramItem[]) {
        const changes: ItemChange[] = [];
        items.forEach(item => {
            changes.push(new ItemChange(item, changeType));
        });
        if(changes.length)
            this.raiseModelChanged(changes);
    }

    insertToContainer(item: DiagramItem, container: Shape): void {
        if(item.container && container && item.container.key !== container.key)
            throw Error("To insert an item to a container it's necessary to remove it from the current container.");

        if(container) {
            if(container.children.indexOf(item) === -1)
                container.children.push(item);
            item.container = container;

            this.raiseModelChanged([new ItemChange(item, ItemChangeType.Update)]);
        }
    }
    removeFromContainer(item: DiagramItem): void {
        if(item.container) {
            const index = item.container.children.indexOf(item);
            item.container.children.splice(index, 1);
            item.container = undefined;

            this.raiseModelChanged([new ItemChange(item, ItemChangeType.Update)]);
        }
    }
    changeStyle(item: DiagramItem, styleProperty: string, styleValue: string): void {
        this.changeStyleCore(item, item.style, styleProperty, styleValue);
    }
    changeStyleText(item: DiagramItem, styleProperty: string, styleValue: string): void {
        this.changeStyleCore(item, item.styleText, styleProperty, styleValue);
    }
    changeStyleCore(item: DiagramItem, styleObj: any, styleProperty: string, styleValue: string): void {
        if(styleValue !== undefined)
            styleObj[styleProperty] = styleValue;
        else
            delete styleObj[styleProperty];

        this.raiseModelChanged([new ItemChange(item, ItemChangeType.UpdateProperties)]);
    }
    changeZIndex(item: DiagramItem, zIndex: number): void {
        item.zIndex = zIndex;
        this.raiseModelChanged([new ItemChange(item, ItemChangeType.Update)]);
    }
    changeLocked(item: DiagramItem, locked: boolean): void {
        item.locked = locked;
        this.raiseModelChanged([new ItemChange(item, ItemChangeType.UpdateClassName)]);
    }
    changeCustomData(item: DiagramItem, data: any): void {
        item.customData = ObjectUtils.cloneObject(data);
        this.raiseModelChanged([new ItemChange(item, ItemChangeType.UpdateStructure)]);
    }
    addShape(shape: Shape, key?: ItemKey): Shape {
        if(shape.attachedConnectors.length)
            throw Error("A creating shape should not contain existing connectors.");
        shape.key = key !== undefined ? key : this.model.getNextKey();
        return this.insertShape(shape);
    }
    insertShape(shape: Shape): Shape {
        this.model.pushItem(shape);
        const allowed = this.permissionsProvider.canAddItems([shape]);
        this.raiseModelChanged([new ItemChange(shape, ItemChangeType.Create, allowed)]);
        this.model.loadAllImages(this.imageLoader);
        return shape;
    }
    resizeShape(shape: Shape, position: Point, size: Size): void {
        shape.position = position;
        shape.size = size;
        let allowed = this.permissionsProvider.isStoredPermissionsGranted();
        const resizeInteractingItem = this.getInteractingItem(shape, DiagramModelOperation.ResizeShape);
        if(resizeInteractingItem) {
            const oldSize = (<Shape>resizeInteractingItem).size.clone();
            const size = shape.size.clone();
            if(!size.equals(oldSize))
                allowed = this.permissionsProvider.canResizeShapes([{ shape, size, oldSize }]);
        }
        const moveInteractingItem = this.getInteractingItem(shape, DiagramModelOperation.MoveShape);
        if(moveInteractingItem) {
            const oldPosition = (<Shape>moveInteractingItem).position.clone();
            const position = shape.position.clone();
            if(!position.equals(oldPosition))
                allowed = this.permissionsProvider.canMoveShapes([{ shape, position, oldPosition }]);
        }
        this.raiseModelChanged([new ItemChange(shape, ItemChangeType.UpdateProperties, allowed)]);
    }
    moveShape(shape: Shape, position: Point): void {
        shape.position = position;
        let allowed = this.permissionsProvider.isStoredPermissionsGranted();
        const addInteractingItem = this.getInteractingItem(shape, DiagramModelOperation.AddShape);
        if(addInteractingItem)
            allowed = this.permissionsProvider.canAddItems([shape]);
        const moveInteractingItem = this.getInteractingItem(shape, DiagramModelOperation.MoveShape);
        if(moveInteractingItem) {
            const oldPosition = (<Shape>moveInteractingItem).position.clone();
            const position = shape.position.clone();
            if(!position.equals(oldPosition))
                allowed = this.permissionsProvider.canMoveShapes([{ shape, position, oldPosition }]);
        }
        this.raiseModelChanged([new ItemChange(shape, ItemChangeType.UpdateProperties, allowed)]);
    }
    changeShapeParameters(shape: Shape, parameters: ShapeParameters): void {
        shape.parameters.forEach((p) => {
            const parameter = parameters.get(p.key);
            if(parameter)
                p.value = parameter.value;
        });
        this.raiseModelChanged([new ItemChange(shape, ItemChangeType.UpdateProperties)]);
    }
    changeShapeText(shape: Shape, text: string): void {
        shape.text = text;
        this.raiseModelChanged([new ItemChange(shape, ItemChangeType.UpdateStructure)]);
    }
    changeShapeImage(shape: Shape, image: ImageInfo): void {
        shape.image = image;
        const cachedImage = ImageCache.instance.createUnloadedInfoByShapeImageInfo(image);
        this.imageLoader.load(cachedImage);

        this.raiseModelChanged([new ItemChange(shape, ItemChangeType.UpdateStructure)]);
    }
    changeShapeExpanded(shape: Shape, expanded: boolean): void {
        shape.expanded = expanded;
        shape.toggleExpandedSize();

        this.raiseModelChanged([new ItemChange(shape, ItemChangeType.UpdateStructure)]);
    }
    deleteShape(shape: Shape, allowed: boolean): void {
        if(shape.attachedConnectors.length)
            throw Error("A removing shape should not contain existing connectors.");
        this.removeShape(shape, allowed);
    }
    removeShape(shape: Shape, allowed: boolean): void {
        this.model.removeItem(shape);
        this.raiseModelChanged([new ItemChange(shape, ItemChangeType.Remove, allowed)]);
    }
    updateShapeImage(cacheImageInfo: CacheImageInfo): void {
        if(!cacheImageInfo.imageUrl) return;
        const shapes = this.model.findShapesByImageUrl(cacheImageInfo.imageUrl);
        shapes.forEach(shape => {
            if(cacheImageInfo.base64)
                shape.image.loadBase64Content(cacheImageInfo.base64);
            else
                shape.image.setUnableToLoadFlag();
        });
        this.commitItemsChangesCore(ItemChangeType.UpdateStructure, shapes);
    }
    updateShapeDescription(description: ShapeDescription): void {
        const shapes = this.model.findShapesByDescription(description);
        this.commitItemsChangesCore(ItemChangeType.UpdateProperties, shapes);
    }
    addConnector(connector: Connector, key?: ItemKey): Connector {
        if(connector.beginItem || connector.endItem)
            throw Error("Creating connector should not contain begin/end items");
        connector.key = key !== undefined ? key : this.model.getNextKey();
        return this.insertConnector(connector);
    }
    insertConnector(connector: Connector): Connector {
        this.model.pushItem(connector);
        const routingStrategy = this.routingModel.createStrategy(connector.properties.lineOption);
        if(routingStrategy)
            connector.changeRoutingStrategy(routingStrategy);
        else
            connector.clearRoutingStrategy();
        const allowed = this.permissionsProvider.canAddItems([connector]);
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.Create, allowed)]);

        return connector;
    }
    deleteConnector(connector: Connector): void {
        if(connector.beginItem || connector.endItem)
            throw Error("Creating connector should not contain begin/end items");
        this.removeConnector(connector);
    }
    removeConnector(connector: Connector): void {
        this.model.removeItem(connector);
        const allowed = this.permissionsProvider.canDeleteItems([connector]);
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.Remove, allowed)]);
    }
    addDeleteConnectorPoint(connector: Connector, callBack: (connector : Connector) => void): void {
        const oldConnectorPoints = this.getConnectorInteractingPoints(connector);
        callBack(connector);
        this.addDeleteConnectorPointCore(connector, oldConnectorPoints);
    }
    moveConnectorPoint(connector: Connector, pointIndex: number, callBack: (connector : Connector) => void): void {
        callBack(connector);
        this.moveConnectorPointCore(connector, pointIndex);
    }
    changeConnectorPoints(connector: Connector, callBack: (connector : Connector) => void): void {
        callBack(connector);
        connector.points.forEach((_, i) => this.moveConnectorPointCore(connector, i));
    }
    private moveConnectorPointCore(connector: Connector, pointIndex: number) {
        const interactingItem = this.getInteractingItem(connector);
        let allowed = this.permissionsProvider.isStoredPermissionsGranted();
        if(interactingItem) {
            let changeConnectionPoints = (0 < pointIndex && pointIndex < connector.points.length - 1);
            changeConnectionPoints = changeConnectionPoints || (pointIndex === 0 && !connector.beginItem);
            changeConnectionPoints = changeConnectionPoints || (pointIndex === connector.points.length - 1 && !connector.endItem);
            if(changeConnectionPoints) {
                const oldConnectorPoints = (interactingItem as Connector).points.map(p => p.clone());
                const newConnectorPoints = connector.points.map(p => p.clone());
                if(!GeometryUtils.arePointsEqual(oldConnectorPoints, newConnectorPoints))
                    allowed = this.permissionsProvider.canChangeConnectorPoints(connector, oldConnectorPoints, newConnectorPoints);
            }
        }
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.UpdateProperties, allowed)]);
    }
    private getConnectorInteractingPoints(connector: Connector) : Point[] {
        const interactingItem = this.getInteractingItem(connector);
        return interactingItem ? (interactingItem as Connector).points.map(p => p.clone()) : connector.points.map(p => p.clone());
    }
    private addDeleteConnectorPointCore(connector: Connector, oldConnectorPoints: Point[]) {
        let allowed = this.permissionsProvider.isStoredPermissionsGranted();
        const newConnectorPoints = connector.points.map(p => p.clone());
        if(!GeometryUtils.arePointsEqual(oldConnectorPoints, newConnectorPoints))
            allowed = this.permissionsProvider.canChangeConnectorPoints(connector, oldConnectorPoints, newConnectorPoints);
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.UpdateProperties, allowed)]);
    }

    addConnection(connector: Connector, item: DiagramItem, connectionPointIndex: number, position: ConnectorPosition): void {
        const existingItem = connector.getExtremeItem(position);
        const existingConnectionPointIndex = connector.getExtremeConnectionPointIndex(position);
        if(existingItem === item && existingConnectionPointIndex === connectionPointIndex)
            return;
        else if(existingItem)
            throw Error("Connector is already connected");
        item.attachedConnectors.push(connector);
        if(position === ConnectorPosition.Begin) {
            connector.beginItem = item;
            connector.beginConnectionPointIndex = connectionPointIndex;
        }
        else {
            connector.endItem = item;
            connector.endConnectionPointIndex = connectionPointIndex;
        }
        connector.invalidateRenderPoints();
        const allowed = this.permissionsProvider.canChangeConnection(connector, item, undefined, position, connectionPointIndex);
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.UpdateProperties, allowed)]);
    }
    setConnectionPointIndex(connector: Connector, connectionPointIndex: number, position: ConnectorPosition): void {
        if(!connector.getExtremeItem(position))
            throw Error("Connection should be connected");
        if(position === ConnectorPosition.Begin)
            connector.beginConnectionPointIndex = connectionPointIndex;
        else
            connector.endConnectionPointIndex = connectionPointIndex;

        connector.invalidateRenderPoints();

        const item = connector.getExtremeItem(position);
        const allowed = this.permissionsProvider.canChangeConnection(connector, item, item, position, connectionPointIndex);
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.UpdateProperties, allowed)]);
    }
    deleteConnection(connector: Connector, position: ConnectorPosition): void {
        const item = connector.getExtremeItem(position);
        if(!item)
            return;
        item.attachedConnectors.splice(item.attachedConnectors.indexOf(connector), 1);
        if(position === ConnectorPosition.Begin) {
            connector.beginItem = null;
            connector.beginConnectionPointIndex = -1;
        }
        else {
            connector.endItem = null;
            connector.endConnectionPointIndex = -1;
        }
        connector.invalidateRenderPoints();
        const allowed = this.permissionsProvider.canChangeConnection(connector, undefined, item, position, -1);
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.UpdateProperties, allowed)]);
    }
    changeConnectorProperty(connector: Connector, propertyName: string, value: any): void {
        connector.properties[propertyName] = value;
        if(propertyName === "lineOption") {
            const routingStrategy = this.routingModel ? this.routingModel.createStrategy(connector.properties.lineOption) : undefined;
            if(routingStrategy)
                connector.changeRoutingStrategy(routingStrategy);
            else
                connector.clearRoutingStrategy();
        }
        else
            connector.invalidateRenderPoints();
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.UpdateProperties)]);
    }
    changeConnectorText(connector: Connector, text: string, position: number): void {
        connector.setText(text, position);
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.UpdateStructure)]);
    }
    changeConnectorTextPosition(connector: Connector, position: number, newPosition: number): void {
        const text = connector.getText(position);
        connector.setText(null, position);
        connector.setText(text, newPosition);
        this.raiseModelChanged([new ItemChange(connector, ItemChangeType.UpdateProperties)]);
    }

    changeModelSize(size: Size, offset: Offsets): void {
        this.model.size.width = size.width;
        this.model.size.height = size.height;
        this.raiseModelSizeChanged(this.model.size.clone(), offset);
        if(offset.left || offset.top) {
            this.model.snapStartPoint = this.model.snapStartPoint.clone().offset(offset.left, offset.top);
            this.raiseSnapPointChange(this.model.snapStartPoint);
        }
    }
    changePageSize(value: Size): void {
        if(!this.model.pageSize.equals(value)) {
            this.model.pageSize = value;
            this.model.size = new Size(this.model.pageWidth, this.model.pageHeight);
            this.raiseModelSizeChanged(this.model.size.clone());
            this.raisePageSizeChanged(this.model.pageSize, this.model.pageLandscape);
        }
    }
    changePageLandscape(value: boolean): void {
        if(this.model.pageLandscape !== value) {
            this.model.pageLandscape = value;
            if(this.model.pageSize.width !== this.model.pageSize.height) {
                this.model.size = new Size(this.model.pageWidth, this.model.pageHeight);
                this.raiseModelSizeChanged(this.model.size.clone());
                this.raisePageSizeChanged(this.model.pageSize, this.model.pageLandscape);
            }
        }
    }
    changePageColor(value: number): void {
        if(this.model.pageColor !== value) {
            this.model.pageColor = value;
            this.raisePageColorChanged(value);
        }
    }

    updateModelSize() {
        const offset = this.getModelSizeUpdateOffset();
        if(!offset.isEmpty()) {
            const newWidth = Math.max(this.model.size.width + offset.left + offset.right, this.model.pageWidth);
            const newHeight = Math.max(this.model.size.height + offset.top + offset.bottom, this.model.pageHeight);
            this.model.size = new Size(newWidth, newHeight);
        }
    }
    getModelSizeUpdateOffset(): Offsets {
        const oldRectangle = this.model.getRectangle(false);
        const newRectangle = this.model.getRectangle(true);
        if(!newRectangle.equals(oldRectangle))
            this.raiseModelRectangleChanged(newRectangle);
        return this.createModelRectangleOffset(newRectangle);
    }
    private createModelRectangleOffset(rectangle: Rectangle): Offsets {
        const pageWidth : number = this.model.pageWidth;
        const pageHeight : number = this.model.pageHeight;
        const size : Size = this.model.size;
        return new Offsets(
            -Math.floor(rectangle.x / pageWidth) * pageWidth,
            -Math.floor((size.width - rectangle.right) / pageWidth) * pageWidth,
            -Math.floor(rectangle.y / pageHeight) * this.model.pageHeight,
            -Math.floor((size.height - rectangle.bottom) / pageHeight) * pageHeight
        );
    }
    private raiseModelChanged(changes: ItemChange[]) {
        this.onModelChanged.raise1(l => l.notifyModelChanged(changes));
    }
    private raisePageColorChanged(color: number) {
        this.onModelChanged.raise1(l => l.notifyPageColorChanged(color));
    }
    private raisePageSizeChanged(pageSize: Size, pageLandscape: boolean) {
        this.onModelChanged.raise1(l => l.notifyPageSizeChanged(pageSize, pageLandscape));
    }
    private raiseModelSizeChanged(size: Size, offset?: Offsets) {
        this.onModelSizeChanged.raise1(l => l.notifyModelSizeChanged(size, offset));
    }
    raiseModelRectangleChanged(rectangle: Rectangle): void {
        this.onModelSizeChanged.raise1(l => l.notifyModelRectangleChanged(rectangle));
    }
    private raiseSnapPointChange(point: Point) {
        this.onModelSizeChanged.raise1(l => l.notifySnapPointPositionChanged(point));
    }

    private getInteractingItem(item: DiagramItem, operation?: DiagramModelOperation): DiagramItem {
        return this.permissionsProvider.getInteractingItem(item, operation);
    }
}

export interface IModelChangesListener {
    notifyModelChanged(changes: ItemChange[]);
    notifyPageColorChanged(color: number);
    notifyPageSizeChanged(pageSize: Size, pageLandscape: boolean);
}

export interface IModelSizeListener {
    notifyModelSizeChanged(size: Size, offset: Offsets);
    notifyModelRectangleChanged(rectangle: Rectangle);
    notifySnapPointPositionChanged(point: Point);
}
