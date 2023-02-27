import { DateRange } from "../../Model/WorkingTime/DateRange";
import { ViewType } from "../Helpers/Enums";

export class DateUtils {
    static readonly msPerMinute = 60 * 1000;
    static readonly msPerHour = 3600000;
    static readonly msPerDay = 24 * DateUtils.msPerHour;
    static readonly msPerWeek = 7 * DateUtils.msPerDay;
    static readonly msPerMonth = 30 * DateUtils.msPerDay;
    static readonly msPerYear = 365 * DateUtils.msPerDay;

    static readonly ViewTypeToScaleMap: { [viewType: number]: ViewType } = createViewTypeToScaleMap();

    static getDaysInQuarter(start: Date): number {
        const month = Math.floor(start.getMonth() / 3) * 3;
        const quarterMonths = [ month, month + 1, month + 2 ];
        return quarterMonths.reduce((acc, m) => acc += DateUtils.getDaysInMonth(m, start.getFullYear()), 0);
    }
    static getDaysInMonth(month: number, year: number): number {
        const d = new Date(year, month + 1, 0);
        return d.getDate();
    }
    static getOffsetInMonths(start: Date, end: Date): number {
        return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
    }
    static getOffsetInQuarters(start: Date, end: Date): number {
        return (end.getFullYear() - start.getFullYear()) * 4 + Math.floor(end.getMonth() / 3) - Math.floor(start.getMonth() / 3);
    }
    static getNearestScaleTickDate(date: Date, range: DateRange, tickTimeSpan: number, viewType: ViewType): Date {
        const result = new Date();
        const rangeStartTime = range.start.getTime();
        const rangeEndTime = range.end.getTime();
        result.setTime(date.getTime());
        if(date.getTime() < rangeStartTime)
            result.setTime(rangeStartTime);
        else if(date.getTime() > rangeEndTime)
            result.setTime(rangeEndTime);
        else if(this.needCorrectDate(date, rangeStartTime, tickTimeSpan, viewType)) {
            const nearestLeftTickTime = this.getNearestLeftTickTime(date, rangeStartTime, tickTimeSpan, viewType);
            const nearestRightTickTime = this.getNextTickTime(nearestLeftTickTime, tickTimeSpan, viewType);
            if(Math.abs(date.getTime() - nearestLeftTickTime) > Math.abs(date.getTime() - nearestRightTickTime))
                result.setTime(nearestRightTickTime);
            else
                result.setTime(nearestLeftTickTime);
        }
        return result;
    }
    static needCorrectDate(date: Date, rangeStartTime: number, tickTimeSpan: number, viewType: ViewType): boolean {
        if(viewType == ViewType.Months)
            return date.getTime() !== new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        return (date.getTime() - rangeStartTime) % tickTimeSpan !== 0;
    }
    static getNearestLeftTickTime(date: Date, rangeStartTime: number, tickTimeSpan: number, viewType: ViewType): number {
        if(viewType == ViewType.Months)
            return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        const tickCountAtLeft = Math.floor((date.getTime() - rangeStartTime) / tickTimeSpan);
        return rangeStartTime + tickCountAtLeft * tickTimeSpan;
    }
    static getNextTickTime(currentTickTime: number, tickTimeSpan: number, viewType: ViewType): number {
        if(viewType == ViewType.Months) {
            const nextTickDate = new Date();
            nextTickDate.setTime(currentTickTime);
            nextTickDate.setMonth(nextTickDate.getMonth() + 1);
            return nextTickDate.getTime();
        }
        return currentTickTime + tickTimeSpan;
    }
    static adjustStartDateByViewType(date: Date, viewType: ViewType, firstDayOfWeek: number = 0): Date {
        switch(viewType) {
            case ViewType.TenMinutes:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
            case ViewType.SixHours:
            case ViewType.Hours:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            case ViewType.Days:
            case ViewType.Weeks:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + firstDayOfWeek);
            case ViewType.Months:
            case ViewType.Quarter:
            case ViewType.Years:
                return new Date(date.getFullYear(), 0, 1);
            default:
                return new Date();
        }
    }
    static adjustEndDateByViewType(date: Date, viewType: ViewType, firstDayOfWeek: number = 0): Date {
        switch(viewType) {
            case ViewType.TenMinutes:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1);
            case ViewType.SixHours:
            case ViewType.Hours:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
            case ViewType.Days:
            case ViewType.Weeks:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7 - date.getDay() + firstDayOfWeek);
            case ViewType.Months:
            case ViewType.Quarter:
            case ViewType.Years:
                return new Date(date.getFullYear() + 1, 0, 1);
            default:
                return new Date();
        }
    }
    static roundStartDate(date: Date, viewType: ViewType): Date {
        switch(viewType) {
            case ViewType.TenMinutes:
            case ViewType.Hours:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() - 1);
            case ViewType.SixHours:
            case ViewType.Days:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
            case ViewType.Weeks:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
            case ViewType.Months:
                return new Date(date.getFullYear(), date.getMonth() - 1);
            case ViewType.Quarter:
            case ViewType.Years:
                return new Date(date.getFullYear() - 1, 0, 1);
            default:
                return new Date();
        }
    }
    static getTickTimeSpan(viewType: ViewType): number {
        switch(viewType) {
            case ViewType.TenMinutes:
                return DateUtils.msPerHour / 6;
            case ViewType.Hours:
                return DateUtils.msPerHour;
            case ViewType.SixHours:
                return DateUtils.msPerHour * 6;
            case ViewType.Days:
                return DateUtils.msPerDay;
            case ViewType.Weeks:
                return DateUtils.msPerWeek;
            case ViewType.Months:
                return DateUtils.msPerMonth;
            case ViewType.Quarter:
                return DateUtils.msPerMonth * 3;
            case ViewType.Years:
                return DateUtils.msPerYear;
        }
    }
    public static getRangeTickCount(start: Date, end: Date, scaleType: ViewType): number {
        if(scaleType === ViewType.Months)
            return this.getRangeTickCountInMonthsViewType(start, end);
        if(scaleType === ViewType.Quarter)
            return this.getRangeTickCountInQuarterViewType(start, end);
        return DateUtils.getRangeMSPeriod(start, end) / DateUtils.getTickTimeSpan(scaleType);
    }
    public static getRangeMSPeriod(start: Date, end: Date): number {
        return end.getTime() - DateUtils.getDSTDelta(start, end) - start.getTime();
    }
    public static getRangeTickCountInMonthsViewType(start: Date, end: Date): number {
        const startMonthStartDate = new Date(start.getFullYear(), start.getMonth(), 1);
        const endMonthStartDate = new Date(end.getFullYear(), end.getMonth(), 1);
        const monthOffset = DateUtils.getOffsetInMonths(startMonthStartDate, endMonthStartDate);
        const endFromMonthStartDateOffset = end.getTime() - endMonthStartDate.getTime();
        const msInEndMonth = DateUtils.getDaysInMonth(end.getMonth(), end.getFullYear()) * DateUtils.msPerDay;
        const startFromMonthStartDateOffset = start.getTime() - startMonthStartDate.getTime();
        const msInStartMonth = DateUtils.getDaysInMonth(start.getMonth(), start.getFullYear()) * DateUtils.msPerDay;
        return monthOffset + endFromMonthStartDateOffset / msInEndMonth - startFromMonthStartDateOffset / msInStartMonth;
    }
    public static getRangeTickCountInQuarterViewType(start: Date, end: Date): number {
        const startQuarterStartDate = new Date(start.getFullYear(), Math.floor(start.getMonth() / 3) * 3, 1);
        const endQuarterStartDate = new Date(end.getFullYear(), Math.floor(end.getMonth() / 3) * 3, 1);
        const quarterOffset = DateUtils.getOffsetInQuarters(startQuarterStartDate, endQuarterStartDate);
        const endFromQuarterStartDateOffset = end.getTime() - endQuarterStartDate.getTime();
        const msInEndQuarter = DateUtils.getDaysInQuarter(endQuarterStartDate) * DateUtils.msPerDay;
        const startFromQuarterStartDateOffset = start.getTime() - startQuarterStartDate.getTime();
        const msInStartQuarter = DateUtils.getDaysInQuarter(startQuarterStartDate) * DateUtils.msPerDay;
        return quarterOffset + endFromQuarterStartDateOffset / msInEndQuarter - startFromQuarterStartDateOffset / msInStartQuarter;
    }
    static parse(data: any): Date {
        return typeof data === "function" ? new Date(data()) : new Date(data);
    }

    static getOrCreateUTCDate(date: Date) : Date {
        const timezoneOffset = date.getTimezoneOffset();
        return timezoneOffset ? new Date(date.valueOf() + timezoneOffset * 60000) : date;
    }
    static getTimezoneOffsetDiff(data1: Date, data2: Date): number {
        return data2.getTimezoneOffset() - data1.getTimezoneOffset();
    }
    static getDSTDelta(start: Date, end: Date): number { 
        const timeZoneDiff = DateUtils.getTimezoneOffsetDiff(start, end) * DateUtils.msPerMinute;
        return timeZoneDiff > 0 ? timeZoneDiff : 0;
    }
    static getDSTCorrectedTaskEnd(start: Date, period: number): Date {
        const time = start.getTime() + period;
        const delta = DateUtils.getDSTDelta(start, new Date(time));
        return new Date(time + delta);
    }
}

function createViewTypeToScaleMap(): { [viewType: number]: ViewType } {
    const result = {};
    result[ViewType.TenMinutes] = ViewType.Hours;
    result[ViewType.Hours] = ViewType.Days;
    result[ViewType.SixHours] = ViewType.Days;
    result[ViewType.Days] = ViewType.Weeks;
    result[ViewType.Weeks] = ViewType.Months;
    result[ViewType.Months] = ViewType.Years;
    result[ViewType.Quarter] = ViewType.Years;
    result[ViewType.Years] = ViewType.FiveYears;
    return result;
}

