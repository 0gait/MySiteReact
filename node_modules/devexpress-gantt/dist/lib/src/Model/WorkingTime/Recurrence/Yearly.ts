import { RecurrenceBase } from "./RecurrenceBase";
import { DateTimeUtils } from "../DateTimeUtils";
import { Month } from "../Month";
import { DayOfWeek } from "../DayOfWeek";
import { DayOfWeekMonthlyOccurrence } from "../DayOfWeekMonthlyOccurrence";

export class Yearly extends RecurrenceBase {
    checkDate(date: Date): boolean {
        if(!DateTimeUtils.checkMonth(this.month, date))
            return false;
        if(this._calculateByDayOfWeek)
            return DateTimeUtils.checkDayOfWeekOccurrenceInMonth(date, this.dayOfWeekInternal, this.dayOfWeekOccurrenceInternal);
        return DateTimeUtils.checkDayOfMonth(this.dayInternal, date);
    }

    checkInterval(date: Date): boolean {
        return DateTimeUtils.getYearsDifference(this.start, date) % this.interval == 0;
    }

    calculatePointByInterval(date: Date): Date {
        const yearFromStart = DateTimeUtils.getYearsDifference(this.start, date);
        const yearInc = Math.floor(yearFromStart / this.interval) * this.interval;
        let newYear = this.start.getFullYear() + yearInc;
        let point = this.getSpecDayInMonth(newYear, this.monthInternal);
        if(DateTimeUtils.compareDates(point, date) >= 0) {
            newYear += this.interval;
            point = this.getSpecDayInMonth(newYear, this.monthInternal);
        }
        return point;
    }

    calculateNearestPoint(date: Date): Date {
        let year = date.getFullYear();
        let point = this.getSpecDayInMonth(year, this.monthInternal);
        if(DateTimeUtils.compareDates(point, date) >= 0)
            point = this.getSpecDayInMonth(++year, this.monthInternal);
        return point;
    }

    public get month(): Month { return this.monthInternal; }
    public set month(value: Month) { this.monthInternal = value; }
    public get day(): number { return this.dayInternal; }
    public set day(value: number) { this.dayInternal = value; }
    public get dayOfWeek(): DayOfWeek { return this.dayOfWeekInternal; }
    public set dayOfWeek(value: DayOfWeek) { this.dayOfWeekInternal = value; }
    public get dayOfWeekOccurrence(): DayOfWeekMonthlyOccurrence { return this.dayOfWeekOccurrenceInternal; }
    public set dayOfWeekOccurrence(value: DayOfWeekMonthlyOccurrence) { this.dayOfWeekOccurrenceInternal = value; }
    public get calculateByDayOfWeek(): boolean { return this._calculateByDayOfWeek; }
    public set calculateByDayOfWeek(value: boolean) { this._calculateByDayOfWeek = value; }
}
