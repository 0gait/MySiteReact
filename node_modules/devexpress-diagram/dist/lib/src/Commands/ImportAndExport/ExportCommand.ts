import { SimpleCommandState } from "../CommandStates";
import { Exporter } from "../../ImportAndExport/Exporter";
import { ExportImportCommandBase } from "./ExportImportCommandBase";

export class ExportCommand extends ExportImportCommandBase {
    executeCore(state: SimpleCommandState, parameter: (data: string) => void): boolean {
        const exporter = new Exporter();
        const data = exporter.export(this.control.model);
        parameter(data);
        return true;
    }
}
