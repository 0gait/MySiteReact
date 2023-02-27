import { ChangeConnectorPropertyCommand } from "./ChangeConnectorPropertyCommand";
import { ConnectorLineOption } from "../../Model/Connectors/ConnectorProperties";

export class ChangeConnectorLineOptionCommand extends ChangeConnectorPropertyCommand {
    getPropertyName(): string {
        return "lineOption";
    }
    getPropertyDefaultValue(): any {
        return ConnectorLineOption.Straight;
    }

}
