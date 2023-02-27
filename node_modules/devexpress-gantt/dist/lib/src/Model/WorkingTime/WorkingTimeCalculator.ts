import { DateRange } from "./DateRange";
import { WorkingDayRuleCollection } from "../Collections/GanttWorkingDayRuleCollection";
import { DayWorkingTimeInfo } from "./DayWorkingTimeInfo";
import { WorkingTimeRule } from "./WorkingTimeRule";
import { DateTimeUtils } from "./DateTimeUtils";

export class WorkingTimeCalculator {
    protected _calculationRange: DateRange;
    protected _workingRules: WorkingDayRuleCollection = new WorkingDayRuleCollection();
    protected _workDayList: Array<DayWorkingTimeInfo> = new Array<DayWorkingTimeInfo>();
    private _noWorkingIntervals: Array<DateRange>;

    constructor(range: DateRange, rules: any) {
        this._calculationRange = range;
        this._workingRules.importFromObject(rules);
    }
    calculateWorkDayList(): void {
        if(!this._calculationRange) return;
        this.clearList();
        const rules = this._workingRules.items;
        for(let i = 0; i < rules.length; i++)
            this.processRule(rules[i]);
        this.sortList();
    }
    processRule(rule: WorkingTimeRule): void {
        const points = rule.recurrence.calculatePoints(this._calculationRange.start, this._calculationRange.end);
        for(let i = 0; i < points.length; i++) {
            const point = points[i];
            const dayNum = DateTimeUtils.getDayNumber(point);
            const dayInfo = this._workDayList.filter(i => i.dayNumber == dayNum)[0];
            if(dayInfo) {
                dayInfo.isWorkDay = dayInfo.isWorkDay && rule.isWorkDay;
                dayInfo.addWorkingIntervals(rule.workTimeRanges);
            }
            else
                this._workDayList.push(new DayWorkingTimeInfo(dayNum, rule.isWorkDay, rule.workTimeRanges));
        }
    }
    sortList(): void {
        this._workDayList.sort((d1, d2) => d1.dayNumber - d2.dayNumber);
    }
    clearList(): void {
        this._workDayList.splice(0, this._workDayList.length);
    }
    calculateNoWorkTimeIntervals(): Array<DateRange> {
        let res = new Array<DateRange>();
        if(this._workDayList.length == 0)
            this.calculateWorkDayList();
        this._workDayList.forEach(d => res = res.concat(this.getNoWorkTimeRangesFromDay(d)));
        return this.concatJointedRanges(res);
    }
    concatJointedRanges(list: Array<DateRange>): Array<DateRange> {
        const res = new Array<DateRange>();
        for(let i = 0; i < list.length; i++) {
            const interval = list[i];
            const needExpandPrevInterval = res.length > 0 && DateTimeUtils.compareDates(res[res.length - 1].end, interval.start) < 2;
            if(needExpandPrevInterval)
                res[res.length - 1].end = interval.end;
            else
                res.push(interval);
        }
        return res;
    }
    getNoWorkTimeRangesFromDay(day: DayWorkingTimeInfo): Array<DateRange> {
        return day.noWorkingIntervals.map(i => DateTimeUtils.convertTimeRangeToDateRange(i, day.dayNumber));
    }
    public get noWorkingIntervals(): Array<DateRange> {
        if(!this._noWorkingIntervals)
            this._noWorkingIntervals = this.calculateNoWorkTimeIntervals();
        return this._noWorkingIntervals.slice();
    }
    updateRange(range: DateRange): void {
        this._calculationRange = range;
        this.invalidate();
    }
    invalidate(): void {
        this._noWorkingIntervals = null;
        this.clearList();
    }
}
