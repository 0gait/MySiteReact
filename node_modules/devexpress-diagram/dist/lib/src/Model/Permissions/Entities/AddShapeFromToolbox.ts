import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { IApiController } from "../../../Api/ApiController";

export class AddShapeFromToolboxRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected shapeType: string) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.AddShapeFromToolbox;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new AddShapeFromToolboxEventArgs(this.shapeType);
    }
    get settingsKey(): string {
        return "addShapeFromToolbox";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + this.shapeType;
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof AddShapeFromToolboxRequestedEntity)
            return this.shapeType === other.shapeType;

        return false;
    }
}

export class AddShapeFromToolboxEventArgs extends PermissionRequestEventArgs {
    constructor(public shapeType: string) {
        super();
    }
}
