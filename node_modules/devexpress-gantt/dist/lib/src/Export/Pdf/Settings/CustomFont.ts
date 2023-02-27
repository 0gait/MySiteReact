import { isDefined } from "@devexpress/utils/lib/utils/common";

export class PdfCustomFontSettings {
    fontObject: any;
    name: string;
    style: string = "normal";
    weight: string | number;
    constructor(source?: Record<string, any> | PdfCustomFontSettings) {
        if(source)
            this.assign(source);
    }

    public assign(source: Record<string, any>): void {
        if(isDefined(source.fontObject))
            this.fontObject = source.fontObject;
        if(isDefined(source.name))
            this.name = source.name as string;
        if(isDefined(source.style))
            this.style = source.style as string;
        if(isDefined(source.weight))
            this.weight = source.weight;
    }
    public applyToDoc(pdfDoc: any): void {
        try {
            if(pdfDoc && this.fontObject && this.name) {
                const fontFileName = this.name + "-" + this.style + ".ttf";
                pdfDoc.addFileToVFS(fontFileName, this.fontObject);
                pdfDoc.addFont(fontFileName, this.name, this.style, this.weight);
                pdfDoc.setFont(this.name);
            }
        }
        catch(e) { }
    }
}
