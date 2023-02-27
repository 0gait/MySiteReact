import { ExportImageCommand, ExportCommandFunc } from "./ExportImageCommand";

export class ExportSvgCommand extends ExportImageCommand {
    getExtension() { return "svg"; }
    getExportFunc(): ExportCommandFunc {
        return this.exporter.exportSvg;
    }
}
