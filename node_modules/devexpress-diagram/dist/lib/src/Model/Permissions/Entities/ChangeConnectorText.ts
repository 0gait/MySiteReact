import { DiagramModelOperation } from "../../../ModelOperationSettings";
import { RequestedEntity, PermissionRequestEventArgs } from "./RequestedEntity";
import { RequestOperationEventArgs } from "../PermissionsProvider";
import { INativeConnector } from "../../../Api/INativeItem";
import { Connector } from "../../Connectors/Connector";
import { IApiController } from "../../../Api/ApiController";

export class ChangeConnectorTextRequestedEntity extends RequestedEntity {
    constructor(apiController: IApiController, protected connector: Connector, protected position: number, protected text: string) {
        super(apiController);
    }

    get operation(): DiagramModelOperation {
        return DiagramModelOperation.ChangeConnectorText;
    }
    protected createEventArgs(): RequestOperationEventArgs {
        return new ChangeConnectorTextEventArgs(
            this.apiController.createNativeConnector(this.connector),
            this.position,
            this.connector.texts.map(t => t).sort((a, b) => a.position - b.position).indexOf(this.connector.texts.get(this.position)),
            this.text
        );
    }
    get settingsKey(): string {
        return "changeConnectorText";
    }
    get storageKey(): string {
        return this.settingsKey + "_" + (this.connector && this.connector.key);
    }
    equals(other: RequestedEntity): boolean {
        if(other instanceof ChangeConnectorTextRequestedEntity)
            return this.connector === other.connector && this.position === other.position && this.text === other.text;

        return false;
    }
}

export class ChangeConnectorTextEventArgs extends PermissionRequestEventArgs {
    constructor(public connector: INativeConnector, public position: number, public index: number, public text: string) {
        super();
    }
}
