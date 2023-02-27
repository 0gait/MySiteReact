import { Shape } from "../../Shapes/Shape";
import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { INativeShape } from "../../../Api/INativeItem";
import { IApiController } from "../../../Api/ApiController";

export class BeforeChangeShapeTextRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected shape: Shape) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.BeforeChangeShapeText;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new BeforeChangeShapeTextEventArgs(
            this.apiController.createNativeShape(this.shape)
        );
    }
    get settingsKey(): string {
        return "changeShapeText";
    }
    get storageKey(): string {
        return "before" + this.settingsKey + "_" + (this.shape && this.shape.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof BeforeChangeShapeTextRequestedEntity)
            return this.shape === other.shape && this.shape.text === other.shape.text;

        return false;
    }
}

export class BeforeChangeShapeTextEventArgs extends PermissionRequestEventArgs {
    constructor(public shape: INativeShape) {
        super();
    }
}
