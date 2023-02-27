import { Shape } from "../../Shapes/Shape";
import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { INativeShape, INativeConnector } from "../../../Api/INativeItem";
import { Connector, ConnectorPosition } from "../../Connectors/Connector";
import { IApiController } from "../../../Api/ApiController";

export class ChangeConnectionRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected connector: Connector, protected shape: Shape, protected oldShape: Shape, protected position: ConnectorPosition, protected connectionPointIndex: number) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.ChangeConnection;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new ChangeConnectionEventArgs(
            this.apiController.createNativeConnector(this.connector),
            this.apiController.createNativeShape(this.shape),
            this.apiController.createNativeShape(this.oldShape),
            this.position,
            this.connectionPointIndex
        );
    }
    get settingsKey(): string {
        return "changeConnection";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.connector && this.connector.key) + "_" + this.position;
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof ChangeConnectionRequestedEntity) {
            const connectorsAreEqual = (!this.connector && !other.connector) || (this.connector && other.connector && this.connector === other.connector);
            const shapesAreEqual = (!this.shape && !other.shape) || (this.shape && other.shape && this.shape === other.shape);
            const oldShapesAreEqual = (!this.oldShape && !other.oldShape) || (this.oldShape && other.oldShape && this.oldShape === other.oldShape);
            return shapesAreEqual && oldShapesAreEqual && connectorsAreEqual && this.position === other.position && this.connectionPointIndex === other.connectionPointIndex;
        }
        return false;
    }
}

export class ChangeConnectionEventArgs extends PermissionRequestEventArgs {
    constructor(public connector: INativeConnector, public shape: INativeShape, public oldShape: INativeShape, public position: ConnectorPosition, public connectionPointIndex: number) {
        super();
    }
}
