import { SimpleCommandState } from "../CommandStates";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { ModelUtils } from "../../Model/ModelUtils";
import { SimpleCommandBase } from "../SimpleCommandBase";

export abstract class CloneCommand extends SimpleCommandBase {
    isEnabled(): boolean {
        const items = this.control.selection.getSelectedItems();
        return super.isEnabled() && items.length && items.length > 0 && this.permissionsProvider.canAddItems(items);
    }
    executeCore(state: SimpleCommandState, parameter?: any): boolean {
        const selectionRect = ModelUtils.createRectangle(this.control.selection.getSelectedItems());
        ModelUtils.cloneSelectionToOffset(
            this.control.history, this.control.model, undefined,
            this.control.selection, this.getOffsetX(selectionRect), this.getOffsetY(selectionRect)
        );
        return true;
    }
    protected get isPermissionsRequired(): boolean { return true; }

    getOffsetX(selectionRect: Rectangle): number {
        return 0;
    }

    getOffsetY(selectionRect: Rectangle): number {
        return 0;
    }
}

export class CloneLeftCommand extends CloneCommand {
    getOffsetX(selectionRect: Rectangle): number {
        return -selectionRect.width;
    }
}

export class CloneRightCommand extends CloneCommand {
    getOffsetX(selectionRect: Rectangle): number {
        return selectionRect.width;
    }
}

export class CloneUpCommand extends CloneCommand {
    getOffsetY(selectionRect: Rectangle): number {
        return -selectionRect.height;
    }
}

export class CloneDownCommand extends CloneCommand {
    getOffsetY(selectionRect: Rectangle): number {
        return selectionRect.height;
    }
}
