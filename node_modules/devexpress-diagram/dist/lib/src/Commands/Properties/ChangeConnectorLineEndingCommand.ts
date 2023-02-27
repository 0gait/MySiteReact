import { ChangeConnectorPropertyCommand } from "./ChangeConnectorPropertyCommand";
import { ConnectorLineEnding } from "../../Model/Connectors/ConnectorProperties";

export class ChangeConnectorStartLineEndingCommand extends ChangeConnectorPropertyCommand {
    getPropertyName(): string {
        return "startLineEnding";
    }
    getPropertyDefaultValue(): any {
        return ConnectorLineEnding.None;
    }
}

export class ChangeConnectorEndLineEndingCommand extends ChangeConnectorPropertyCommand {
    getPropertyName(): string {
        return "endLineEnding";
    }
    getPropertyDefaultValue(): any {
        return ConnectorLineEnding.Arrow;
    }
}
