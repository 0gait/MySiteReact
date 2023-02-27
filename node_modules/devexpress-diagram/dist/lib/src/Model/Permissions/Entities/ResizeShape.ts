import { Shape } from "../../Shapes/Shape";
import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { IApiController } from "../../../Api/ApiController";
import { INativeShape } from "../../../Api/INativeItem";

export class ResizeShapeRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected shape: Shape, protected oldSize: Size, protected size: Size) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.ResizeShape;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new ResizeShapeEventArgs(
            this.apiController.createNativeShape(this.shape),
            this.apiController.convertSize(this.oldSize),
            this.apiController.convertSize(this.size)
        );
    }
    get settingsKey(): string {
        return "resizeShape";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.shape && this.shape.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof ResizeShapeRequestedEntity)
            return this.shape === other.shape && this.oldSize.equals(other.oldSize) && this.size.equals(other.size);

        return false;
    }
}

export class ResizeShapeEventArgs extends PermissionRequestEventArgs {
    constructor(public shape: INativeShape, public oldSize: Size, public size: Size) {
        super();
    }
}

export interface IResizeShapeInfo {
    shape: Shape;
    oldSize: Size;
    size: Size;
}
