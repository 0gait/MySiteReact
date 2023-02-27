import { EditShapeImageCommandBase } from "./EditShapeImageCommandBase";

export class EditShapeImageCommand extends EditShapeImageCommandBase {
    isEnabled(): boolean {
        const selectedShape = this.getSelectedShape();
        return super.isEnabled() && !selectedShape.image.isEmpty;
    }
}
