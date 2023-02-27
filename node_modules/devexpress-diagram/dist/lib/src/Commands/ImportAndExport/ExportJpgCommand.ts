import { ExportImageCommand, ExportCommandFunc } from "./ExportImageCommand";

export class ExportJpgCommand extends ExportImageCommand {
    getExtension() { return "jpg"; }
    getExportFunc(): ExportCommandFunc {
        return this.exporter.exportJpg;
    }
}
