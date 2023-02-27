import { Time } from "./Time";
import { TimeRange } from "./TimeRange";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DateRange } from "./DateRange";
import { Month } from "./Month";
import { DayOfWeek } from "./DayOfWeek";
import { DayOfWeekMonthlyOccurrence } from "./DayOfWeekMonthlyOccurrence";

export class DateTimeUtils {
    static readonly msInDay: number = 24 * 3600 * 1000;
    static compareDates(date1: Date, date2: Date): number {
        if(!date1 || !date2) return -1;
        return date2.getTime() - date1.getTime();
    }
    static areDatesEqual(date1: Date, date2: Date): boolean {
        return this.compareDates(date1, date2) == 0;
    }
    static getMaxDate(date1: Date, date2: Date): Date {
        if(!date1 && !date2) return null;
        if(!date1) return date2;
        if(!date2) return date1;
        const diff = this.compareDates(date1, date2);
        return diff > 0 ? date2 : date1;
    }
    static getMinDate(date1: Date, date2: Date): Date {
        if(!date1 && !date2) return null;
        if(!date1) return date2;
        if(!date2) return date1;
        const diff = this.compareDates(date1, date2);
        return diff > 0 ? date1 : date2;
    }
    static getDaysBetween(start: Date, end: Date): number {
        const diff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diff / this.msInDay);
    }
    static getWeeksBetween(start: Date, end: Date): number {
        const daysBetween = this.getDaysBetween(start, end);
        let numWeeks = Math.floor(daysBetween / 7);
        if(start.getDay() > end.getDay())
            numWeeks++;
        return numWeeks;
    }
    static getMonthsDifference(start: Date, end: Date): number {
        const dateDiff = this.compareDates(start, end);
        const from = dateDiff >= 0 ? start : end;
        const to = dateDiff >= 0 ? end : start;
        const yearsDiff = to.getFullYear() - from.getFullYear();
        const monthDiff = yearsDiff * 12 + (to.getMonth() - from.getMonth());

        return monthDiff;
    }
    static getYearsDifference(start: Date, end: Date): number {
        return Math.abs(end.getFullYear() - start.getFullYear());
    }
    static getDayNumber(date: Date): number {
        return Math.ceil(date.getTime() / this.msInDay);
    }
    static getDateByDayNumber(num: number): Date {
        const date = new Date(num * this.msInDay);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        return date;
    }
    static addDays(date: Date, days: number): Date {
        return new Date(date.getTime() + days * this.msInDay);
    }
    static checkDayOfMonth(day: number, date: Date): boolean {
        return day == date.getDate();
    }
    static checkDayOfWeek(day: DayOfWeek, date: Date): boolean {
        return day == date.getDay();
    }
    static checkMonth(month: Month, date: Date): boolean {
        return month == date.getMonth();
    }
    static checkYear(year: number, date: Date): boolean {
        return year == date.getFullYear();
    }
    static checkDayOfWeekOccurrenceInMonth(date: Date, dayOfWeek: DayOfWeek, occurrence: DayOfWeekMonthlyOccurrence): boolean {
        const dayOfWeekInMonthDates = this.getSpecificDayOfWeekInMonthDates(dayOfWeek, date.getFullYear(), date.getMonth());
        if(occurrence == DayOfWeekMonthlyOccurrence.Last)
            return this.areDatesEqual(date, dayOfWeekInMonthDates[dayOfWeekInMonthDates.length - 1]);

        return this.areDatesEqual(date, dayOfWeekInMonthDates[occurrence]);
    }
    static getFirstDayOfWeekInMonth(year: number, month: number): number {
        const date = new Date(year, month, 1);
        return date.getDay();
    }
    static getSpecificDayOfWeekInMonthDates(dayOfWeek: DayOfWeek, year: number, month: number): Array<Date> {
        const firstDayOfWeekInMonth = this.getFirstDayOfWeekInMonth(year, month);
        const diffDays = dayOfWeek >= firstDayOfWeekInMonth ? dayOfWeek - firstDayOfWeekInMonth : dayOfWeek + 7 - firstDayOfWeekInMonth;

        const res = new Array<Date>();
        let specificDayOfWeekDate = new Date(year, month, diffDays + 1);
        while(specificDayOfWeekDate.getMonth() == month) {
            res.push(specificDayOfWeekDate);
            specificDayOfWeekDate = this.addDays(specificDayOfWeekDate, 7);
        }
        return res;
    }
    static getSpecificDayOfWeekInMonthDate(dayOfWeek: DayOfWeek, year: number, month: Month, occurrence: DayOfWeekMonthlyOccurrence): Date {
        const dates = this.getSpecificDayOfWeekInMonthDates(dayOfWeek, year, month);
        if(occurrence == DayOfWeekMonthlyOccurrence.Last)
            return dates[dates.length - 1];
        return dates[occurrence];
    }
    static checkValidDayInMonth(year: number, month: Month, day: number): boolean {
        if(day < 1 || day > 31 || (new Date(year, month, day)).getMonth() != month)
            return false;
        return true;
    }
    static getNextMonth(month: Month, inc: number = 1): Month {
        return (month + inc) % 12;
    }
    static convertToDate(src: any): Date {
        if(src instanceof Date)
            return new Date(src);
        const ms = Date.parse(src as string);
        if(!isNaN(ms))
            return new Date(ms);
        return null;
    }
    static convertTimeRangeToDateRange(timeRange: TimeRange, dayNumber: number): DateRange {
        const date = this.getDateByDayNumber(dayNumber);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const startT = timeRange.start;
        const start = new Date(year, month, day, startT.hour, startT.min, startT.sec, startT.msec);
        const endT = timeRange.end;
        const end = new Date(year, month, day, endT.hour, endT.min, endT.sec, endT.msec);
        return new DateRange(start, end);
    }
    static convertToTimeRanges(src: any): Array<TimeRange> {
        if(src instanceof Array)
            return src.map(x => this.convertToTimeRange(x));
        return this.parseTimeRanges(src as string);
    }
    static convertToTimeRange(src: any): TimeRange {
        if(!src) return null;
        if(src instanceof TimeRange)
            return src;
        if(isDefined(src.start) && isDefined(src.end))
            return new TimeRange(this.convertToTime(src.start), this.convertToTime(src.end));
        return this.parseTimeRange(src as string);
    }
    static convertToTime(src: any): Time {
        if(!src) return null;
        if(src instanceof Time)
            return src;
        if(src instanceof Date)
            return this.getTimeGromJsDate(src);
        return this.parseTime(src as string);
    }
    static parseTimeRanges(src: string): Array<TimeRange> {
        if(!src) return null;

        const parts = src.split(/;|,/);
        return parts.map(p => this.parseTimeRange(p)).filter(r => !!r);
    }
    static parseTimeRange(src: string): TimeRange {
        if(!src) return null;

        const parts = src.split("-");
        const start = parts[0];
        const end = parts[1];
        if(isDefined(start) && isDefined(end))
            return new TimeRange(this.parseTime(start), this.parseTime(end));
        return null;
    }
    static parseTime(src: string): Time {
        if(!src) return null;
        const parts = src.split(":");
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        const s = parseInt(parts[2]) || 0;
        const ms = parseInt(parts[3]) || 0;
        return new Time(h, m, s, ms);
    }
    static getTimeGromJsDate(date: Date): Time {
        if(!date) return null;
        const h = date.getHours();
        const m = date.getMinutes();
        const s = date.getSeconds();
        const ms = date.getMilliseconds();
        return new Time(h, m, s, ms);
    }
    static caclTimeDifference(time1: Time, time2: Time): number {
        return time2.getTimeInMilleconds() - time1.getTimeInMilleconds();
    }
    static areTimesEqual(time1: Time, time2: Time): boolean {
        return this.caclTimeDifference(time1, time2) == 0;
    }
    static getMaxTime(time1: Time, time2: Time): Time {
        if(!time1 && !time2) return null;
        if(!time1) return time2;
        if(!time2) return time1;
        const diff = this.caclTimeDifference(time1, time2);
        return diff > 0 ? time2 : time1;
    }
    static getMinTime(time1: Time, time2: Time): Time {
        if(!time1 && !time2) return null;
        if(!time1) return time2;
        if(!time2) return time1;
        const diff = this.caclTimeDifference(time1, time2);
        return diff > 0 ? time1 : time2;
    }
    static getLastTimeOfDay(): Time {
        return new Time(23, 59, 59, 999);
    }
}
