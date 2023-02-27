import { Time } from "./Time";
import { DateTimeUtils } from "./DateTimeUtils";

export class TimeRange {
    private _start: Time;
    private _end: Time;
    constructor(start: Time, end: Time) {
        const diff = DateTimeUtils.caclTimeDifference(start, end);
        if(diff >= 0) {
            this._start = start;
            this._end = end;
        }
        else {
            this._start = end;
            this._end = start;
        }
    }

    public get start(): Time { return this._start; }
    public set start(time: Time) {
        if(time && DateTimeUtils.caclTimeDifference(time, this._end) >= 0)
            this._start = time;
    }

    public get end(): Time { return this._end; }
    public set end(time: Time) {
        if(time && DateTimeUtils.caclTimeDifference(this._start, time) >= 0)
            this._end = time;
    }

    isTimeInRange(time: Time): boolean {
        return DateTimeUtils.caclTimeDifference(this._start, time) >= 0 && DateTimeUtils.caclTimeDifference(time, this._end) >= 0;
    }
    hasIntersect(range: TimeRange): boolean {
        return this.isTimeInRange(range.start) || this.isTimeInRange(range.end) || range.isTimeInRange(this.start) || range.isTimeInRange(this.end);
    }
    concatWith(range: TimeRange): boolean {
        if(!this.hasIntersect(range))
            return false;
        this.start = DateTimeUtils.getMinTime(this.start, range.start);
        this.end = DateTimeUtils.getMaxTime(this.end, range.end);
        return true;
    }
}
