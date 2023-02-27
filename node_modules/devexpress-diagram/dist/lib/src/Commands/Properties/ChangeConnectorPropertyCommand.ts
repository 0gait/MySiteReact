import { SimpleCommandState } from "../CommandStates";
import { ChangeConnectorPropertyHistoryItem } from "../../History/Properties/ChangeConnectorPropertyHistoryItem";
import { SimpleCommandBase } from "../SimpleCommandBase";

export abstract class ChangeConnectorPropertyCommand extends SimpleCommandBase {
    getValue(): any {
        return this.control.selection.inputPosition.getCurrentConnectorPropertyValue(this.getPropertyName());
    }
    getDefaultValue(): any {
        return this.getPropertyDefaultValue();
    }
    executeCore(state: SimpleCommandState, parameter: any) {
        this.control.history.beginTransaction();
        const connectors = this.control.selection.getSelectedConnectors();
        connectors.forEach(connector => {
            const propertyName = this.getPropertyName();
            this.control.history.addAndRedo(new ChangeConnectorPropertyHistoryItem(connector.key, propertyName, parameter));
        });
        this.control.selection.inputPosition.setConnectorPropertyValue(this.getPropertyName(), parameter);
        this.control.history.endTransaction();
        return true;
    }
    protected lockInputPositionUpdating() {
        return true;
    }
    isEnabled(): boolean {
        const connectors = this.control.selection.getSelectedConnectors();
        return super.isEnabled() && connectors.length > 0;
    }
    abstract getPropertyName(): string;
    abstract getPropertyDefaultValue(): any;
}
