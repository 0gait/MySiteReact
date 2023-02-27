import { IModelChangesListener } from "../Model/ModelManipulator";
import { ItemChange, ItemChangeType } from "../Model/ModelChange";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { CanvasManagerBase } from "./CanvasManagerBase";

export abstract class CanvasManager extends CanvasManagerBase implements IModelChangesListener {
    pendingChanges: { [key: number]: ItemChange } = {};
    pendingRemoveChanges: { [key: number]: ItemChange } = {};
    private updatesLock: number = 0;

    beginUpdate() {
        this.updatesLock++;
    }
    endUpdate() {
        this.updatesLock--;
        if(this.updatesLock === 0)
            this.applyPendingChanges();
    }
    getPendingChanges() {
        return Object.keys(this.pendingChanges).map(key => this.pendingChanges[key]);
    }
    getPendingRemoveChanges() {
        return Object.keys(this.pendingRemoveChanges).map(key => this.pendingRemoveChanges[key]);
    }
    applyPendingChanges() {
        const removeChanges = this.getPendingRemoveChanges();
        if(removeChanges.length) {
            this.applyChangesCore(removeChanges);
            this.pendingRemoveChanges = {};
        }

        const changes = this.getPendingChanges();
        if(changes.length) {
            this.applyChangesCore(changes);
            this.pendingChanges = {};
        }
    }
    applyChangesCore(changes: ItemChange[]) {
        const changesToReapply = [];
        changes.forEach(change => {
            if(!this.applyChange(change))
                changesToReapply.push(change);
        });
        if(changesToReapply.length && changesToReapply.length !== changes.length)
            this.applyChangesCore(changesToReapply);

    }
    abstract applyChange(change: ItemChange);

    postponeChanges(changes: ItemChange[]) {
        changes.forEach(change => {
            if(change.type === ItemChangeType.Remove) {
                this.pendingRemoveChanges[change.key] = change;
                delete this.pendingChanges[change.key];
            }
            else if(!this.pendingChanges[change.key]) {
                if(this.pendingRemoveChanges[change.key] && change.type !== ItemChangeType.Create)
                    throw new Error("Incorrect model changes sequence.");
                this.pendingChanges[change.key] = change;
            }
            else if(change.type === ItemChangeType.Create)
                this.pendingChanges[change.key] = change;

            else if(change.type === ItemChangeType.UpdateStructure) {
                if(this.pendingChanges[change.key].type === ItemChangeType.UpdateProperties)
                    this.pendingChanges[change.key] = change;
            }
            else if(change.type === ItemChangeType.UpdateProperties) {
                if(this.pendingChanges[change.key].type === ItemChangeType.Update)
                    this.pendingChanges[change.key] = change;
            }
            else if(change.type === ItemChangeType.UpdateClassName)
                if(this.pendingChanges[change.key].type === ItemChangeType.UpdateClassName)
                    this.pendingChanges[change.key] = change;
        });
    }

    applyOrPostponeChanges(changes: ItemChange[]) {
        if(this.updatesLock === 0)
            this.applyChangesCore(changes);
        else
            this.postponeChanges(changes);
    }
    notifyModelChanged(changes: ItemChange[]) {
        this.applyOrPostponeChanges(changes);
    }
    notifyPageColorChanged(color: number) { }
    notifyPageSizeChanged(pageSize: Size, pageLandscape: boolean) { }
}
