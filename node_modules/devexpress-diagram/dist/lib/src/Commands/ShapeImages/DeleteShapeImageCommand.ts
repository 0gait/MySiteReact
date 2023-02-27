import { SimpleCommandState } from "../CommandStates";
import { EditShapeImageCommandBase } from "./EditShapeImageCommandBase";

export class DeleteShapeImageCommand extends EditShapeImageCommandBase {
    isEnabled(): boolean {
        const selectedShape = this.getSelectedShape();
        return super.isEnabled() && !selectedShape.image.isEmpty;
    }
    executeCore(state: SimpleCommandState, parameter: string) {
        return super.executeCore(state, undefined);
    }
}
