import { Shape } from "../../Shapes/Shape";
import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { INativeShape } from "../../../Api/INativeItem";
import { IApiController } from "../../../Api/ApiController";

export class ChangeShapeTextRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected shape: Shape, protected text: string) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.ChangeShapeText;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new ChangeShapeTextEventArgs(
            this.apiController.createNativeShape(this.shape),
            this.text
        );
    }
    get settingsKey(): string {
        return "changeShapeText";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.shape && this.shape.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof ChangeShapeTextRequestedEntity)
            return this.shape === other.shape && this.text === other.text;

        return false;
    }
}

export class ChangeShapeTextEventArgs extends PermissionRequestEventArgs {
    constructor(public shape: INativeShape, public text: string) {
        super();
    }
}
