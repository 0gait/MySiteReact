import { Shape } from "../../Shapes/Shape";
import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { IApiController } from "../../../Api/ApiController";
import { INativeShape } from "../../../Api/INativeItem";

export class DeleteShapeRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected shape: Shape) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.DeleteShape;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new DeleteShapeEventArgs(this.apiController.createNativeShape(this.shape));
    }
    get settingsKey(): string {
        return "deleteShape";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.shape && this.shape.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof DeleteShapeRequestedEntity)
            return this.shape === other.shape;

        return false;
    }
}

export class DeleteShapeEventArgs extends PermissionRequestEventArgs {
    constructor(public shape: INativeShape) {
        super();
    }
}
