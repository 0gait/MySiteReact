import { SimpleCommandBase } from "../SimpleCommandBase";
import { SimpleCommandState } from "../CommandStates";
import { ConnectorRoutingMode } from "../../Settings";

export class ChangeConnectorRoutingModeCommand extends SimpleCommandBase {
    getValue(): any {
        return this.control.settings.connectorRoutingMode;
    }
    executeCore(state: SimpleCommandState, parameter?: any): boolean {
        const mode = parameter !== undefined ? parameter : ConnectorRoutingMode.None;
        this.control.settings.connectorRoutingMode = mode;
        return true;
    }
}
