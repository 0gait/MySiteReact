import { EditShapeImageCommandBase } from "./EditShapeImageCommandBase";

export class InsertShapeImageCommand extends EditShapeImageCommandBase {
    isEnabled(): boolean {
        const selectedShape = this.getSelectedShape();
        return super.isEnabled() && selectedShape.image.isEmpty;
    }
}
