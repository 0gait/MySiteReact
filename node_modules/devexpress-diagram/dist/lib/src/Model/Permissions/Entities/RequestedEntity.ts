import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { IApiController } from "../../../Api/ApiController";

export abstract class RequestedEntity {
    protected apiController: IApiController;
    protected _eventArgs: RequestOperationEventArgs;

    constructor(apiController: IApiController) {
        this.apiController = apiController;
    }

    get allowed(): boolean {
        return this.eventArgs.allowed;
    }
    get updateUI(): boolean {
        return this.eventArgs.updateUI;
    }
    get eventArgs(): RequestOperationEventArgs {
        if(!this._eventArgs)
            this._eventArgs = this.createEventArgs();
        return this._eventArgs;
    }
    protected abstract createEventArgs(): RequestOperationEventArgs;

    abstract get operation(): DiagramModelOperation;
    abstract get settingsKey(): string;
    abstract get storageKey(): string;
    abstract equals(other: RequestedEntity): boolean;
}

export class PermissionRequestEventArgs {
    allowed: boolean = true;
    updateUI: boolean = false;
}
