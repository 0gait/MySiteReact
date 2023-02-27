import { Shape } from "../../Shapes/Shape";
import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { IApiController } from "../../../Api/ApiController";
import { INativeShape } from "../../../Api/INativeItem";
import { Point } from "../../..";

export class MoveShapeRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected shape: Shape, protected oldPosition: Point, protected position: Point) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.MoveShape;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new MoveShapeEventArgs(
            this.apiController.createNativeShape(this.shape),
            this.apiController.convertPoint(this.oldPosition),
            this.apiController.convertPoint(this.position)
        );
    }
    get settingsKey(): string {
        return "moveShape";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.shape && this.shape.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof MoveShapeRequestedEntity)
            return this.shape === other.shape && this.oldPosition.equals(other.oldPosition) && this.position.equals(other.position);

        return false;
    }
}

export class MoveShapeEventArgs extends PermissionRequestEventArgs {
    constructor(public shape: INativeShape, public oldPosition: Point, public position: Point) {
        super();
    }
}

export interface IMoveShapeInfo {
    shape: Shape;
    oldPosition: Point;
    position: Point;
}
