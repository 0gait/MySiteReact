import { DiagramItem } from "../DiagramItem";
import { Shape } from "../Shapes/Shape";
import { Connector } from "../Connectors/Connector";
import { DiagramModelOperation } from "../..";

export class PermissionsProviderStorage {
    protected interactingItems: { [key: string]: DiagramItem } = {};
    protected storedPermissions: { [key: string]: boolean } = {};
    protected storePermissions: boolean;

    addInteractingItem(item: DiagramItem, operation?: DiagramModelOperation): void {
        const key = this.getInteractingItemKey(item, operation);
        if(this.interactingItems[key] === undefined && (item instanceof Shape || item instanceof Connector))
            this.interactingItems[key] = item.clone();
    }
    getInteractingItem(item: DiagramItem, operation?: DiagramModelOperation): DiagramItem {
        const key = this.getInteractingItemKey(item, operation);
        return this.interactingItems[key];
    }
    getInteractingItemCount(): number {
        return Object.keys(this.interactingItems).length;
    }
    clearInteractingItems(): void {
        this.interactingItems = {};
    }
    private getInteractingItemKey(item: DiagramItem, operation?: DiagramModelOperation): string {
        return item.key + (operation !== undefined ? "_" + operation.toString() : "");
    }

    needStorePermissions(): boolean {
        return this.storePermissions;
    }
    beginStorePermissions(): void {
        this.storePermissions = true;
    }
    endStorePermissions(): void {
        this.storePermissions = false;
        this.storedPermissions = {};
    }
    isStoredPermissionsGranted(): boolean {
        const keys = Object.keys(this.storedPermissions);
        let granted = true;
        for(let i = 0; i < keys.length; i++)
            granted = granted && this.storedPermissions[keys[i]];
        return granted;
    }
    storePermission(key: string, allowed: boolean): void {
        this.storedPermissions[key] = allowed;
    }
}
