import { SimpleCommandState } from "../CommandStates";
import { ChangeShapeImageHistoryItem } from "../../History/Properties/ChangeShapeImageHistoryItem";
import { SimpleCommandBase } from "../SimpleCommandBase";
import { Shape } from "../../Model/Shapes/Shape";

export class EditShapeImageCommandBase extends SimpleCommandBase {
    isEnabled(): boolean {
        const selectedShape = this.getSelectedShape();
        return super.isEnabled() && !!selectedShape && !selectedShape.locked && selectedShape.enableImage && selectedShape.allowEditImage;
    }
    getValue(): any {
        const selectedShape = this.getSelectedShape();
        const imageUrl = (selectedShape) ? selectedShape.image.exportUrl : undefined;
        return imageUrl;
    }
    getSelectedShape(): Shape {
        const selectedShapes = this.control.selection.getSelectedShapes(true);
        return (selectedShapes.length === 1) ? selectedShapes[0] : undefined;
    }
    executeCore(state: SimpleCommandState, parameter: string) {
        this.control.history.beginTransaction();
        const selectedUnlockedShapes = this.control.selection.getSelectedShapes(false);
        this.control.history.addAndRedo(new ChangeShapeImageHistoryItem(selectedUnlockedShapes[0], parameter));
        this.control.history.endTransaction();
        return true;
    }
}
