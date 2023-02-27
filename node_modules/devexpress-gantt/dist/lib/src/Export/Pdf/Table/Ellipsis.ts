export class EllipsisHelper {
    static ellipsis = "...";

    public static limitPdfTextWithEllipsis(text: string, pdfDoc: any, size: number): string {
        if(!pdfDoc?.getTextWidth || !size)
            return text;

        const pdfTextWidth = pdfDoc.getTextWidth(text.toString());
        if(pdfTextWidth > size) {
            let outputText = text;
            let pos = text.length - 1;
            while(pdfDoc.getTextWidth(outputText) > size && pos > 0) {
                outputText = outputText.substring(0, pos) + EllipsisHelper.ellipsis;
                pos--;
            }

            return outputText;
        }
        return text;
    }
}
