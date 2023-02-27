import { Shape } from "../../Shapes/Shape";
import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { INativeShape } from "../../../Api/INativeItem";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { IApiController } from "../../../Api/ApiController";

export class AddShapeRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected shape: Shape) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.AddShape;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new AddShapeEventArgs(
            this.apiController.createNativeShape(this.shape),
            this.apiController.convertPoint(this.shape.position)
        );
    }
    get settingsKey(): string {
        return "addShape";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.shape && this.shape.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof AddShapeRequestedEntity)
            return this.shape === other.shape && this.shape.position.equals(other.shape.position);

        return false;
    }
}

export class AddShapeEventArgs extends PermissionRequestEventArgs {
    constructor(public shape: INativeShape, public position: Point) {
        super();
    }
}
