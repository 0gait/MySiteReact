import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { INativeConnector } from "../../../Api/INativeItem";
import { Connector } from "../../Connectors/Connector";
import { IApiController } from "../../../Api/ApiController";

export class BeforeChangeConnectorTextRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected connector: Connector, protected position: number) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.BeforeChangeConnectorText;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new BeforeChangeConnectorTextEventArgs(
            this.apiController.createNativeConnector(this.connector),
            this.position,
            this.connector.texts.map(t => t).sort((a, b) => a.position - b.position).indexOf(this.connector.texts.get(this.position))
        );
    }
    get settingsKey(): string {
        return "changeConnectorText";
    }
    get storageKey(): string {
        return "before" + this.settingsKey + "_" + (this.connector && this.connector.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof BeforeChangeConnectorTextRequestedEntity)
            return this.connector === other.connector && this.position === other.position && this.connector.texts.get(this.position) === other.connector.texts.get(other.position);

        return false;
    }
}

export class BeforeChangeConnectorTextEventArgs extends PermissionRequestEventArgs {
    constructor(public connector: INativeConnector, public position: number, public index: number) {
        super();
    }
}
