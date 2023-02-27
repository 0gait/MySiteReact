import { SimpleCommandState } from "../CommandStates";
import { Importer } from "../../ImportAndExport/Importer";
import { ExportImportCommandBase } from "./ExportImportCommandBase";

export class ImportCommand extends ExportImportCommandBase {
    executeCore(state: SimpleCommandState, parameter: string | { data: string, keepExistingItems: boolean }): boolean {
        this.permissionsProvider.lockPermissions();
        const data = parameter["data"] ? parameter["data"] : parameter;
        const importer = new Importer(this.control.shapeDescriptionManager, data);
        if(parameter["keepExistingItems"] === true) {
            importer.importItemsData(this.control.model);
            this.control.importItemsData();
        }
        else {
            const model = importer.import();
            this.control.importModel(model);
        }
        this.permissionsProvider.unlockPermissions();
        return true;
    }
}
