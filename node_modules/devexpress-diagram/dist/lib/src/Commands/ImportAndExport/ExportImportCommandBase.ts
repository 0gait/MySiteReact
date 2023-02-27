import { SimpleCommandBase } from "../SimpleCommandBase";

export abstract class ExportImportCommandBase extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
}
