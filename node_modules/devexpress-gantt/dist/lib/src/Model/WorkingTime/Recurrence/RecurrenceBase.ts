import { DayOfWeek } from "../DayOfWeek";
import { DayOfWeekMonthlyOccurrence } from "../DayOfWeekMonthlyOccurrence";
import { Month } from "../Month";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DateTimeUtils } from "../DateTimeUtils";
import { RecurrenceFactory } from "./RecurrenceFactory";
import { DataObject } from "../../Entities/DataObject";

export abstract class RecurrenceBase extends DataObject {
    private _start: Date = null;
    private _end: Date = null;
    private _interval: number = 1;
    private _occurrenceCount: number = 0;
    private _dayOfWeek: DayOfWeek = 0;
    private _day: number = 1;
    private _dayOfWeekOccurrence: DayOfWeekMonthlyOccurrence = 0;
    private _month: Month = 0;
    protected _calculateByDayOfWeek: boolean = false;

    constructor(start: Date = null, end: Date = null, interval: number = 1, occurrenceCount: number = 0) {
        super();
        this.start = start;
        this.end = end;
        this.interval = interval;
        this.occurrenceCount = occurrenceCount;
    }
    assignFromObject(sourceObj: any) {
        if(isDefined(sourceObj)) {
            super.assignFromObject(sourceObj);
            this.start = DateTimeUtils.convertToDate(sourceObj.start);
            this.end = DateTimeUtils.convertToDate(sourceObj.end);
            if(isDefined(sourceObj.interval))
                this.interval = sourceObj.interval;
            if(isDefined(sourceObj.occurrenceCount))
                this.occurrenceCount = sourceObj.occurrenceCount;
            if(isDefined(sourceObj.dayOfWeek))
                this.dayOfWeekInternal = RecurrenceFactory.getEnumValue(DayOfWeek, sourceObj.dayOfWeek);
            if(isDefined(sourceObj.day))
                this.dayInternal = sourceObj.day;
            if(isDefined(sourceObj.dayOfWeekOccurrence))
                this.dayOfWeekOccurrenceInternal = RecurrenceFactory.getEnumValue(DayOfWeekMonthlyOccurrence, sourceObj.dayOfWeekOccurrence);
            if(isDefined(sourceObj.month))
                this.monthInternal = RecurrenceFactory.getEnumValue(Month, sourceObj.month);
            if(isDefined(sourceObj.calculateByDayOfWeek))
                this._calculateByDayOfWeek = !!sourceObj.calculateByDayOfWeek;
        }
    }

    calculatePoints(start: Date, end: Date): Array<Date> {
        if(!start || !end) return new Array<Date>();

        const from = DateTimeUtils.getMaxDate(start, this._start);
        const to = DateTimeUtils.getMinDate(end, this._end);

        if(this._occurrenceCount > 0)
            return this.calculatePointsByOccurrenceCount(from, to);
        return this.calculatePointsByDateRange(from, to);
    }
    calculatePointsByOccurrenceCount(start: Date, end: Date): Array<Date> {
        const points = new Array<Date>();
        let point = this.getFirstPoint(start);
        while(!!point && points.length < this._occurrenceCount && DateTimeUtils.compareDates(point, end) >= 0) {
            if(this.isRecurrencePoint(point))
                points.push(point);
            point = this.getNextPoint(point);
        }
        return points;
    }
    calculatePointsByDateRange(start: Date, end: Date): Array<Date> {
        const points = new Array<Date>();
        let point = this.getFirstPoint(start);

        while(!!point && DateTimeUtils.compareDates(point, end) >= 0) {
            if(this.isRecurrencePoint(point))
                points.push(point);
            point = this.getNextPoint(point);
        }
        return points;
    }
    getFirstPoint(start: Date): Date {
        if(this.isRecurrencePoint(start))
            return start;
        return this.getNextPoint(start);
    }
    isRecurrencePoint(date: Date): boolean {
        return this.isDateInRange(date) && this.checkDate(date) && (!this.useIntervalInCalc() || this.checkInterval(date));
    }
    isDateInRange(date: Date): boolean {
        if(!date)
            return false;
        if(this._start && DateTimeUtils.compareDates(this.start, date) < 0)
            return false;
        if(this._occurrenceCount == 0 && this.end && DateTimeUtils.compareDates(date, this.end) < 0)
            return false;
        return true;
    }
    useIntervalInCalc(): boolean {
        return this.interval > 1 && !!this._start;
    }
    getNextPoint(date: Date): Date {
        if(!this.isDateInRange(date)) return null;
        if(this.useIntervalInCalc())
            return this.calculatePointByInterval(date);
        return this.calculateNearestPoint(date);
    }
    getSpecDayInMonth(year: number, month: Month): Date {
        let date: Date;
        if(this._calculateByDayOfWeek)
            date = DateTimeUtils.getSpecificDayOfWeekInMonthDate(this.dayOfWeekInternal, year, month, this.dayOfWeekOccurrenceInternal);
        else
            date = new Date(year, month, this.dayInternal);
        return date;
    }
    abstract calculatePointByInterval(date: Date): Date;
    abstract calculateNearestPoint(date: Date): Date;
    abstract checkDate(date: Date): boolean;
    abstract checkInterval(date: Date): boolean;

    protected get dayInternal(): number { return this._day; }
    protected set dayInternal(value: number) {
        if(value > 0 && value <= 31)
            this._day = value;
    }
    protected get dayOfWeekInternal(): DayOfWeek { return this._dayOfWeek; }
    protected set dayOfWeekInternal(dayOfWeek: DayOfWeek) {
        if(dayOfWeek >= DayOfWeek.Sunday && dayOfWeek <= DayOfWeek.Saturday)
            this._dayOfWeek = dayOfWeek;
    }
    protected get dayOfWeekOccurrenceInternal(): DayOfWeekMonthlyOccurrence {
        return this._dayOfWeekOccurrence;
    }
    protected set dayOfWeekOccurrenceInternal(value: DayOfWeekMonthlyOccurrence) {
        if(value >= DayOfWeekMonthlyOccurrence.First && value <= DayOfWeekMonthlyOccurrence.Last)
            this._dayOfWeekOccurrence = value;
    }
    protected get monthInternal(): Month { return this._month; }
    protected set monthInternal(value: Month) {
        if(value >= Month.January && value <= Month.December)
            this._month = value;
    }
    get start(): Date { return this._start; }
    set start(date: Date) {
        if(!date) return;
        this._start = date;
        if(!!this._end && date > this._end)
            this._end = date;
    }
    get end(): Date { return this._end; }
    set end(date: Date) {
        if(!date) return;
        this._end = date;
        if(!!this._start && date < this._start)
            this._start = date;
    }
    get occurrenceCount(): number { return this._occurrenceCount; }
    set occurrenceCount(value: number) {
        if(value < 0) value = 0;
        this._occurrenceCount = value;
    }
    get interval(): number { return this._interval; }
    set interval(value: number) {
        if(value > 0)
            this._interval = value;
    }
}
