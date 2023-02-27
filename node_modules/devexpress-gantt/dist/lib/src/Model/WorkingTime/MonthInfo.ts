import { Month } from "./Month";
import { DateTimeUtils } from "./DateTimeUtils";

export class MonthInfo {
    constructor(public month: Month, public year: number) { }

    addMonths(months: number): void {
        const nextMonth = DateTimeUtils.getNextMonth(this.month, months);
        let yearInc = Math.floor(months / 12);
        if(nextMonth < this.month)
            ++yearInc;
        this.month = nextMonth;
        this.year += yearInc;
    }
}
