import { isDefined } from "@devexpress/utils/lib/utils/common";

export class PdfDataRange {
    constructor(start?: Date | Record<string, any>, endDate?: Date, startIndex?: number, endIndex?: number) {
        const source = !start || start instanceof Date ? { startDate: start, endDate: endDate, startIndex: startIndex, endIndex: endIndex } : start;
        if(source)
            this.assign(source);
    }
    public startDate: Date;
    public endDate: Date;
    public startIndex: number;
    public endIndex: number;

    public assign(source: Record<string, any>): void {
        if(isDefined(source.startDate))
            this.startDate = source.startDate instanceof Date ? source.startDate : new Date(source.startDate);
        if(isDefined(source.endDate))
            this.endDate = source.endDate instanceof Date ? source.endDate : new Date(source.endDate);
        if(isDefined(source.startIndex))
            this.startIndex = parseInt(source.startIndex);
        if(isDefined(source.endIndex))
            this.endIndex = parseInt(source.endIndex);
    }
}
