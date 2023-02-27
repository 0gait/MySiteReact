import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { INativeConnector } from "../../../Api/INativeItem";
import { Connector } from "../../Connectors/Connector";
import { IApiController } from "../../../Api/ApiController";

export class DeleteConnectorRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected connector: Connector) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.DeleteConnector;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new DeleteConnectorEventArgs(this.apiController.createNativeConnector(this.connector));
    }
    get settingsKey(): string {
        return "deleteConnector";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.connector && this.connector.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof DeleteConnectorRequestedEntity)
            return this.connector === other.connector;

        return false;
    }
}

export class DeleteConnectorEventArgs extends PermissionRequestEventArgs {
    constructor(public connector: INativeConnector) {
        super();
    }
}
