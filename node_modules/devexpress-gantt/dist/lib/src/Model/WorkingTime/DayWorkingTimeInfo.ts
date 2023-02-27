import { TimeRange } from "./TimeRange";
import { DateTimeUtils } from "./DateTimeUtils";
import { Time } from "./Time";

export class DayWorkingTimeInfo {
    protected _workingIntervals: Array<TimeRange> = new Array<TimeRange>();
    protected _isWorkDay: boolean;
    dayNumber: number;

    constructor(dayNumber: number = 0, isWorkDay: boolean = true, intervals: Array<TimeRange> = null) {
        this.dayNumber = dayNumber;
        this.isWorkDay = isWorkDay;
        this.addWorkingIntervals(intervals);
    }

    addWorkingIntervals(intervals: Array<TimeRange>): void {
        if(!intervals) return;
        this._workingIntervals = this._workingIntervals.concat(intervals.filter(r => !!r));
        this.rearrangeWorkingIntervals();
    }
    rearrangeWorkingIntervals(): void {
        for(let i = 0; i < this._workingIntervals.length; i++)
            this.concatWithIntersectedRanges(this._workingIntervals[i]);
        this.sortIntervals();
    }
    concatWithIntersectedRanges(range: TimeRange): void {
        const intersectedRanges = this.getIntersectedIntervals(range);
        intersectedRanges.forEach(r => {
            range.concatWith(r);
            this.removeInterval(r);
        });
    }
    getIntersectedIntervals(range: TimeRange): Array<TimeRange> {
        return this._workingIntervals.filter(r => r.hasIntersect(range) && r !== range);
    }
    sortIntervals(): void {
        this._workingIntervals.sort((r1, r2) => DateTimeUtils.caclTimeDifference(r2.start, r1.start));
    }
    removeInterval(element: TimeRange): void {
        const index = this._workingIntervals.indexOf(element);
        if(index > -1 && index < this._workingIntervals.length)
            this._workingIntervals.splice(index, 1);
    }
    clearIntervals(): void {
        this._workingIntervals.splice(0, this._workingIntervals.length);
    }
    public get workingIntervals(): Array<TimeRange> { return this._workingIntervals.slice(); }
    public get noWorkingIntervals(): Array<TimeRange> {
        const res = new Array<TimeRange>();
        if(this.isWorkDay && this._workingIntervals.length === 0)
            return res;

        const starts = this._workingIntervals.map(r => r.end);
        starts.splice(0, 0, new Time());
        const ends = this._workingIntervals.map(r => r.start);
        ends.push(DateTimeUtils.getLastTimeOfDay());
        for(let i = 0; i < starts.length; i++) {
            const start = starts[i];
            const end = ends[i];
            if(!DateTimeUtils.areTimesEqual(start, end))
                res.push(new TimeRange(start, end));
        }
        return res;
    }
    public get isWorkDay():boolean { return this._isWorkDay; }
    public set isWorkDay(value: boolean) {
        this._isWorkDay = value;
        if(!value)
            this.clearIntervals();
    }
}
