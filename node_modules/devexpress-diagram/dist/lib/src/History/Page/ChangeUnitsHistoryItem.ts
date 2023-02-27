import { HistoryItem } from "../HistoryItem";
import { ModelManipulator } from "../../Model/ModelManipulator";
import { DiagramUnit } from "../../Enums";

export class ChangeUnitsHistoryItem extends HistoryItem {
    units: DiagramUnit;
    oldUnits: DiagramUnit;

    constructor(units: DiagramUnit) {
        super();
        this.units = units;
    }

    redo(manipulator: ModelManipulator) {
        this.oldUnits = manipulator.model.units;
        manipulator.model.units = this.units;
    }
    undo(manipulator: ModelManipulator) {
        manipulator.model.units = this.oldUnits;
    }
}
