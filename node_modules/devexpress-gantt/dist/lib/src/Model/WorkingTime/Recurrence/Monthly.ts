import { RecurrenceBase } from "./RecurrenceBase";
import { DateTimeUtils } from "../DateTimeUtils";
import { MonthInfo } from "../MonthInfo";
import { DayOfWeek } from "../DayOfWeek";
import { DayOfWeekMonthlyOccurrence } from "../DayOfWeekMonthlyOccurrence";

export class Monthly extends RecurrenceBase {
    checkDate(date: Date): boolean {
        if(this._calculateByDayOfWeek)
            return DateTimeUtils.checkDayOfWeekOccurrenceInMonth(date, this.dayOfWeekInternal, this.dayOfWeekOccurrenceInternal);
        return DateTimeUtils.checkDayOfMonth(this.dayInternal, date);
    }
    checkInterval(date: Date): boolean {
        return DateTimeUtils.getMonthsDifference(this.start, date) % this.interval == 0;
    }
    calculatePointByInterval(date: Date): Date {
        const start = this.start;
        const monthFromStart = DateTimeUtils.getMonthsDifference(start, date);
        const monthToAdd = Math.floor(monthFromStart / this.interval) * this.interval;
        const info = new MonthInfo(start.getMonth(), start.getFullYear());
        info.addMonths(monthToAdd);
        let point = this.getSpecDayInMonth(info.year, info.month);
        if(DateTimeUtils.compareDates(point, date) >= 0) {
            info.addMonths(this.interval);
            point = this.getSpecDayInMonth(info.year, info.month);
        }
        return point;
    }
    calculateNearestPoint(date: Date): Date {
        const month = date.getMonth();
        const year = date.getFullYear();
        let point = this.getSpecDayInMonth(year, month);
        if(DateTimeUtils.compareDates(point, date) >= 0) {
            const info = new MonthInfo(month, year);
            info.addMonths(1);
            point = this.getSpecDayInMonth(info.year, info.month);
        }
        return point;
    }
    public get day(): number { return this.dayInternal; }
    public set day(value: number) { this.dayInternal = value; }
    public get dayOfWeek(): DayOfWeek { return this.dayOfWeekInternal; }
    public set dayOfWeek(value: DayOfWeek) { this.dayOfWeekInternal = value; }
    public get dayOfWeekOccurrence(): DayOfWeekMonthlyOccurrence { return this.dayOfWeekOccurrenceInternal; }
    public set dayOfWeekOccurrence(value: DayOfWeekMonthlyOccurrence) { this.dayOfWeekOccurrenceInternal = value; }
    public get calculateByDayOfWeek(): boolean { return this._calculateByDayOfWeek; }
    public set calculateByDayOfWeek(value: boolean) { this._calculateByDayOfWeek = value; }
}
