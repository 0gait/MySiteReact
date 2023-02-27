export class DateRange {
    constructor(start: Date, end: Date) {
        this.start = start;
        this.end = end;
    }
    start: Date;
    end: Date;

    equal(date: DateRange): boolean {
        let result = true;
        result = result && this.start.getTime() === date.start.getTime();
        result = result && this.end.getTime() === date.end.getTime();

        return result;
    }
}
