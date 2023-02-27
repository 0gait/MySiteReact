import { Shape } from "../Shapes/Shape";
import { DiagramItem } from "../DiagramItem";
import { EventDispatcher } from "../../Utils";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ModelOperationSettings, DiagramModelOperation } from "../../ModelOperationSettings";
import { Connector, ConnectorPosition } from "../Connectors/Connector";
import { RequestedEntity } from "./Entities/RequestedEntity";
import { AddShapeRequestedEntity, AddShapeEventArgs } from "./Entities/AddShape";
import { DeleteShapeRequestedEntity, DeleteShapeEventArgs } from "./Entities/DeleteShape";
import { DeleteConnectorRequestedEntity, DeleteConnectorEventArgs } from "./Entities/DeleteConnector";
import { AddShapeFromToolboxRequestedEntity, AddShapeFromToolboxEventArgs } from "./Entities/AddShapeFromToolbox";
import { ChangeConnectionRequestedEntity, ChangeConnectionEventArgs } from "./Entities/ChangeConnection";
import { ChangeConnectorPointsRequestedEntity, ChangeConnectorPointsEventArgs } from "./Entities/ChangeConnectorPoints";
import { BeforeChangeShapeTextRequestedEntity, BeforeChangeShapeTextEventArgs } from "./Entities/BeforeChangeShapeText";
import { BeforeChangeConnectorTextRequestedEntity } from "./Entities/BeforeChangeConnectorText";
import { ChangeShapeTextEventArgs, ChangeShapeTextRequestedEntity } from "./Entities/ChangeShapeText";
import { ChangeConnectorTextRequestedEntity } from "./Entities/ChangeConnectorText";
import { PermissionsProviderStorage } from "./PermissionsProviderStorage";
import { ResizeShapeRequestedEntity, IResizeShapeInfo } from "./Entities/ResizeShape";
import { IApiController } from "../../Api/ApiController";
import { ISelectionChangesListener, Selection } from "../../Selection/Selection";
import { IMoveShapeInfo, MoveShapeRequestedEntity } from "./Entities/MoveShape";
import { IModelChangesListener } from "../ModelManipulator";
import { ItemChange } from "../ModelChange";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class PermissionsProvider implements ISelectionChangesListener, IModelChangesListener {
    apiController: IApiController;
    operationSettings: ModelOperationSettings;
    storage: PermissionsProviderStorage;

    onRequestOperation: EventDispatcher<IPermissionRequestListener> = new EventDispatcher();

    private cache: RequestedEntity[] = [];

    private permissionsLockCount: number = 0;
    private requestDeleteItems: {[key: string]: DiagramItem} = {};
    private updateUICount: number = 0;

    constructor(apiController: IApiController) {
        this.apiController = apiController;
        this.operationSettings = new ModelOperationSettings();
        this.storage = new PermissionsProviderStorage();
    }

    notifySelectionChanged(_selection: Selection): void {
        this.clearCache();
    }
    notifyModelChanged(changes: ItemChange[]) {
        this.clearCache();
    }
    notifyPageColorChanged(color: number) {}
    notifyPageSizeChanged(pageSize: Size, pageLandscape: boolean) {}

    clearCache(operation?: DiagramModelOperation): void {
        if(operation !== undefined)
            this.cache = this.cache.filter(entry => entry.operation !== operation);
        else
            this.cache = [];
    }
    canDeleteItems(items: DiagramItem[]): boolean {
        let allowed = true;
        items.forEach((item) => {
            let entity: RequestedEntity;
            if(item instanceof Shape)
                entity = new DeleteShapeRequestedEntity(this.apiController, item);
            if(item instanceof Connector)
                entity = new DeleteConnectorRequestedEntity(this.apiController, item);
            allowed = allowed && this.requestOperation(entity);
        });
        return allowed;
    }
    canAddItems(items: DiagramItem[]): boolean {
        let allowed = true;
        items.forEach((item) => {
            if(item instanceof Shape)
                allowed = allowed && this.requestOperation(new AddShapeRequestedEntity(this.apiController, item));
            if(item instanceof Connector) {
                allowed = allowed && this.canChangeConnection(item, item.beginItem, undefined, ConnectorPosition.Begin, item.beginConnectionPointIndex);
                allowed = allowed && this.canChangeConnection(item, item.endItem, undefined, ConnectorPosition.End, item.endConnectionPointIndex);
            }
        });
        return allowed;
    }
    canAddShapeFromToolbox(itemType: string): boolean {
        return this.requestOperation(new AddShapeFromToolboxRequestedEntity(this.apiController, itemType));
    }
    canChangeConnection(connector: Connector, item: DiagramItem, oldItem: DiagramItem, position: ConnectorPosition, connectionPointIndex: number): boolean {
        if(connector && this.requestDeleteItems[connector.key])
            return true;
        if(item === undefined || item === null || item instanceof Shape)
            return this.requestOperation(new ChangeConnectionRequestedEntity(this.apiController, connector, item as Shape, oldItem as Shape, position, connectionPointIndex));
        return true;
    }
    canChangeConnectorPoints(connector: Connector, oldPoints: Point[], points: Point[]): boolean {
        if(connector && this.requestDeleteItems[connector.key])
            return true;
        return this.requestOperation(new ChangeConnectorPointsRequestedEntity(this.apiController, connector, oldPoints, points));
    }
    canChangeShapeText(shape: Shape): boolean {
        return this.requestOperation(new BeforeChangeShapeTextRequestedEntity(this.apiController, shape));
    }
    canChangeConnectorText(connector: Connector, position: number): boolean {
        return this.requestOperation(new BeforeChangeConnectorTextRequestedEntity(this.apiController, connector, position));
    }
    canApplyShapeTextChange(shape: Shape, textToApply: string): boolean {
        return this.requestOperation(new ChangeShapeTextRequestedEntity(this.apiController, shape, textToApply));
    }
    canApplyConnectorTextChange(connector: Connector, position: number, textToApply: string): boolean {
        return this.requestOperation(new ChangeConnectorTextRequestedEntity(this.apiController, connector, position, textToApply));
    }
    canResizeShapes(shapeInfo: IResizeShapeInfo[]): boolean {
        let allowed = true;
        shapeInfo.forEach((info) => {
            allowed = allowed && this.requestOperation(new ResizeShapeRequestedEntity(this.apiController, info.shape, info.oldSize, info.size));
        });
        return allowed;
    }
    canMoveShapes(shapeInfo: IMoveShapeInfo[]): boolean {
        let allowed = true;
        shapeInfo.forEach((info) => {
            allowed = allowed && this.requestOperation(new MoveShapeRequestedEntity(this.apiController, info.shape, info.oldPosition, info.position));
        });
        return allowed;
    }

    private requestOperation(entity: RequestedEntity): boolean {
        let allowed = true;
        if(!this.permissionsLockCount) {
            let cachedEntity;
            if(this.updateUICount > 0)
                this.cache.forEach(item => {
                    if(item.equals(entity)) {
                        cachedEntity = item;
                        return;
                    }
                });

            if(cachedEntity)
                allowed = cachedEntity.allowed;
            else {
                this.requestOperationCore(entity);
                if(this.updateUICount > 0)
                    this.cache.push(entity);
                allowed = entity.allowed;
            }
            if(this.updateUICount === 0 && this.storage.needStorePermissions()) {
                this.storage.storePermission(entity.storageKey, allowed);
                return this.storage.isStoredPermissionsGranted();
            }
        }
        return allowed;
    }
    private requestOperationCore(entity: RequestedEntity) {
        entity.eventArgs.allowed = this.operationSettings[entity.settingsKey];
        entity.eventArgs.updateUI = this.updateUICount > 0;
        if(entity.allowed)
            this.onRequestOperation.raise("notifyRequestOperation", entity.operation, entity.eventArgs);
    }

    lockPermissions(): void {
        this.permissionsLockCount++;
    }
    unlockPermissions(): void {
        this.permissionsLockCount--;
    }
    beginDeleteItems(items: DiagramItem[]): void {
        items.forEach(item => this.requestDeleteItems[item.key] = item);
    }
    endDeleteItems(): void {
        this.requestDeleteItems = {};
    }
    beginUpdateUI(): void {
        this.updateUICount++;
    }
    endUpdateUI(): void {
        this.updateUICount--;
    }

    addInteractingItem(item: DiagramItem, operation?: DiagramModelOperation): void {
        this.storage.addInteractingItem(item, operation);
    }
    getInteractingItem(item: DiagramItem, operation?: DiagramModelOperation): DiagramItem {
        return this.storage.getInteractingItem(item, operation);
    }
    getInteractingItemCount(): number {
        return this.storage.getInteractingItemCount();
    }
    clearInteractingItems(): void {
        this.storage.clearInteractingItems();
    }

    beginStorePermissions(): void {
        this.storage.beginStorePermissions();
    }
    endStorePermissions(): void {
        this.storage.endStorePermissions();
    }
    isStoredPermissionsGranted(): boolean {
        return this.permissionsLockCount > 0 || this.storage.isStoredPermissionsGranted();
    }
}

export interface IPermissionsProvider {
    lockPermissions(): void;
    unlockPermissions(): void;
    beginDeleteItems(items: DiagramItem[]): void;
    endDeleteItems(): void;
    beginUpdateUI(): void;
    endUpdateUI(): void;

    canDeleteItems(items: DiagramItem[]): boolean;
    canAddItems(items: DiagramItem[]): boolean;
    canAddShapeFromToolbox(itemType: string): boolean;
    canChangeConnection(connector: Connector, item: DiagramItem, oldItem: DiagramItem, position: ConnectorPosition, connectionPointIndex: number): boolean;
    canChangeConnectorPoints(connector: Connector, oldPoints: Point[], points: Point[]): boolean;
    canChangeShapeText(shape: Shape): boolean;
    canChangeConnectorText(connector: Connector, position: number): boolean;
    canApplyShapeTextChange(shape: Shape, textToApply: string): boolean;
    canApplyConnectorTextChange(connector: Connector, position: number, textToApply: string): boolean;
    canResizeShapes(shapeInfo: IResizeShapeInfo[]): boolean;
    canMoveShapes(shapeInfo: IMoveShapeInfo[]): boolean;

    addInteractingItem(item: DiagramItem, operation?: DiagramModelOperation);
    getInteractingItem(item: DiagramItem, operation?: DiagramModelOperation): DiagramItem;
    getInteractingItemCount(): number;
    clearInteractingItems();

    beginStorePermissions(): void;
    endStorePermissions(): void;
    isStoredPermissionsGranted(): boolean;
}

export interface IPermissionRequestListener {
    notifyRequestOperation(operation: DiagramModelOperation, args: RequestOperationEventArgs);
}

export type RequestOperationEventArgs = DeleteShapeEventArgs | DeleteConnectorEventArgs | AddShapeFromToolboxEventArgs |
                                        AddShapeEventArgs | ChangeConnectionEventArgs | ChangeConnectorPointsEventArgs |
                                        BeforeChangeShapeTextEventArgs | BeforeChangeShapeTextEventArgs | ChangeShapeTextEventArgs;
