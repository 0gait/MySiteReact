import { SimpleCommandState } from "../CommandStates";
import { XmlImporter } from "../../ImportAndExport/XMLImporter";
import { ExportImportCommandBase } from "./ExportImportCommandBase";

export class ImportXMLCommand extends ExportImportCommandBase {
    executeCore(state: SimpleCommandState, parameter: string): boolean {
        const importer = new XmlImporter(this.control.shapeDescriptionManager, parameter);
        const model = importer.import();
        this.control.importModel(model);
        return true;
    }
}
