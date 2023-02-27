import { ICommandState, ICommand } from "./ICommand";
import { DiagramControl } from "../Diagram";
import { IPermissionsProvider } from "../Model/Permissions/PermissionsProvider";

export abstract class CommandBase<T extends ICommandState> implements ICommand {
    control: DiagramControl;

    constructor(control: DiagramControl) {
        this.control = control;
    }
    abstract getState(): T;
    abstract executeCore(state: T, parameter?: any): boolean;

    execute(parameter?: any): boolean {
        if(this.isPermissionsRequired)
            this.permissionsProvider.lockPermissions();
        const state: T = this.getState();
        if(this.isPermissionsRequired)
            this.permissionsProvider.unlockPermissions();
        if(!state.enabled)
            return false;
        this.control.beginUpdate();
        let executed = false;
        if(this.isPermissionsRequired)
            executed = this.executeWithPermissions(state, parameter);
        else
            executed = this.executeCore(state, parameter);
        this.control.endUpdate();
        if(executed)
            this.updateControlState();
        return executed;
    }
    executeWithPermissions(state: T, parameter?: any): boolean {
        let executed = false;
        this.permissionsProvider.beginStorePermissions();
        this.control.history.beginTransaction();
        executed = this.executeCore(state, parameter);
        if(!this.permissionsProvider.isStoredPermissionsGranted()) {
            this.permissionsProvider.lockPermissions();
            this.control.history.undoTransaction();
            this.permissionsProvider.unlockPermissions();
            executed = false;
        }
        this.control.history.endTransaction();
        this.permissionsProvider.endStorePermissions();
        return executed;
    }

    updateControlState() {
        if(!this.lockInputPositionUpdating())
            this.control.selection.inputPosition.reset();
        if(!this.lockUIUpdating())
            this.control.barManager.updateItemsState();
    }

    protected get permissionsProvider(): IPermissionsProvider { return this.control && this.control.permissionsProvider; }
    protected get isPermissionsRequired(): boolean { return false; }

    protected lockUIUpdating(): boolean {
        return false;
    }
    protected lockInputPositionUpdating(): boolean {
        return false;
    }
}
