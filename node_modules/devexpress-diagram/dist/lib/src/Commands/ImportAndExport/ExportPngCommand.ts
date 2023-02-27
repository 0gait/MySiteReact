import { ExportImageCommand, ExportCommandFunc } from "./ExportImageCommand";

export class ExportPngCommand extends ExportImageCommand {
    getExtension() { return "png"; }
    getExportFunc(): ExportCommandFunc {
        return this.exporter.exportPng;
    }
}
