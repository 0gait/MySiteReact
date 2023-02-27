import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { INativeConnector } from "../../../Api/INativeItem";
import { Connector } from "../../Connectors/Connector";
import { Point } from "../../..";
import { GeometryUtils } from "../../../Utils";
import { IApiController } from "../../../Api/ApiController";

export class ChangeConnectorPointsRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected connector: Connector, protected oldPoints: Point[], protected points: Point[]) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.ChangeConnectorPoints;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new ChangeConnectorPointsEventArgs(
            this.apiController.createNativeConnector(this.connector),
            this.oldPoints.map(pt => this.apiController.convertPoint(pt)),
            this.points.map(pt => this.apiController.convertPoint(pt))
        );
    }
    get settingsKey(): string {
        return "changeConnectorPoints";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.connector && this.connector.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof ChangeConnectorPointsRequestedEntity)
            return this.connector === other.connector &&
                GeometryUtils.arePointsEqual(this.oldPoints, other.oldPoints) &&
                GeometryUtils.arePointsEqual(this.points, other.points);
        return false;
    }
}

export class ChangeConnectorPointsEventArgs extends PermissionRequestEventArgs {
    constructor(public connector: INativeConnector, public oldPoints: Point[], public points: Point[]) {
        super();
    }
}
