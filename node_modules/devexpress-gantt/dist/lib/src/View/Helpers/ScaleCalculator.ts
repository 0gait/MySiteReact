import { Point } from "@devexpress/utils/lib/geometry/point";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { DateRange } from "../../Model/WorkingTime/DateRange";
import { DateUtils } from "../Utils/DateUtils";
import { ViewType } from "./Enums";

export class ScaleItemInfo {
    constructor(start: Date, end: Date, position: Point, size: Size) {
        this.start = start;
        this.end = end;
        this.position = position;
        this.size = size;
    }

    start: Date;
    end: Date;
    position: Point;
    size: Size;
}

export class ScaleCalculator {

    range: DateRange;
    viewType: ViewType;
    tickSize: Size;
    firstDayOfWeek: number = 0;


    private _topScaleItems: Array<ScaleItemInfo>;
    private _bottomScaleItems: Array<ScaleItemInfo>;
    private _scaleWidth: number;

    public setSettings(range: DateRange, viewType: ViewType, tickSize: Size, firstDayOfWeek: number = 0): void {
        this.range = range;
        this.viewType = viewType;
        this.tickSize = tickSize;
        this.firstDayOfWeek = firstDayOfWeek;

        this.reset();
    }
    public setViewType(viewType: ViewType): void {
        this.viewType = viewType;
        this.reset();
    }
    protected reset(): void {
        delete this._bottomScaleItems;
        delete this._topScaleItems;
        delete this._scaleWidth;
    }
    public getScaleIndexByPos(pos: number, scaleType?: ViewType): number {
        scaleType ??= this.viewType;
        const items = scaleType === this.viewType ? this.bottomScaleItems : this.topScaleItems;
        let index = -1;
        if(items.findIndex)
            index = items.findIndex(i => pos >= i.position.x && pos <= i.position.x + i.size.width);
        else { 
            const item = items.filter(i => pos >= i.position.x && pos <= i.position.x + i.size.width)[0];
            if(item)
                index = items.indexOf(item);
        }
        return index;
    }
    public getScaleBorderPosition(index: number, scaleType: ViewType): number {
        const item = this.getScaleItems(scaleType)[index];
        if(item)
            return item.position.x + item.size.width;
    }
    public getScaleItems(scaleType: ViewType): Array<ScaleItemInfo> {
        if(scaleType === this.viewType)
            return this.bottomScaleItems;
        if(scaleType === DateUtils.ViewTypeToScaleMap[this.viewType])
            return this.topScaleItems;
        return null;
    }
    public getScaleItem(index: number, scaleType: ViewType): ScaleItemInfo {
        return this.getScaleItems(scaleType)[index];
    }
    public getScaleItemAdjustedStart(index: number, scaleType: ViewType): Date {
        const item = this.getScaleItems(scaleType)[index];
        if(index > 0)
            return item.start;
        const isTopScale = scaleType !== this.viewType;
        let date = isTopScale ? DateUtils.adjustStartDateByViewType(this.range.start, this.viewType, this.firstDayOfWeek) : this.getAdjustedBottomScaleItemStart(item.start, scaleType, this.firstDayOfWeek);
        if(isTopScale && scaleType === ViewType.Months) {
            const ref = this.range.start;
            date = new Date(ref.getFullYear(), ref.getMonth(), 1);
        }
        if(isTopScale && scaleType === ViewType.FiveYears) {
            const year = Math.trunc(date.getFullYear() / 5) * 5;
            date = new Date(year, date.getMonth(), date.getDate());
        }
        return date;
    }

    public get topScaleItems(): Array<ScaleItemInfo> {
        this._topScaleItems ??= this.calculateTopScale(DateUtils.ViewTypeToScaleMap[this.viewType]);
        return this._topScaleItems;
    }
    public get bottomScaleItems(): Array<ScaleItemInfo> {
        this._bottomScaleItems ??= this.calculateBottomScale(this.viewType);
        return this._bottomScaleItems;
    }
    public get scaleWidth(): number {
        this._scaleWidth ??= this.calculateScaleWidth();
        return this._scaleWidth;
    }
    getFirstScaleIndexForRender(startPos: number): number {
        let result = this.getScaleIndexByPos(startPos);
        result = Math.max(result - 10, 0);
        return result;
    }
    getLastScaleIndexForRender(endPos: number): number {
        let result = this.getScaleIndexByPos(endPos);
        if(result === -1)
            result = this.bottomScaleItems.length - 1;
        else
            result = Math.min(result + 10, this.bottomScaleItems.length - 1);
        return result;
    }
    public getTopScaleIndexByBottomIndex(index: number): number {
        const bottomItem = this.bottomScaleItems[index];
        return bottomItem ? this.getScaleIndexByPos(bottomItem.position.x, DateUtils.ViewTypeToScaleMap[this.viewType]) : -1;
    }

    protected calculateBottomScale(scaleType: ViewType): Array<ScaleItemInfo> {
        const items = new Array<ScaleItemInfo>();
        const defWidth = this.tickSize.width;

        let currentDate = this.range.start;
        let x = 0;
        while(currentDate.getTime() < this.range.end.getTime()) {
            const nextDate = this.getNextScaleDate(currentDate, scaleType);
            const isStart = currentDate.getTime() === this.range.start.getTime();
            const isEnd = nextDate.getTime() >= this.range.end.getTime();
            const width = isStart || isEnd ? this.getRangeTickCount(currentDate, nextDate) * defWidth : defWidth;
            items.push(new ScaleItemInfo(currentDate, nextDate, new Point(x, undefined), new Size(width, 0)));
            currentDate = nextDate;
            x += width;
        }
        return items;
    }
    protected calculateTopScale(scaleType: ViewType): Array<ScaleItemInfo> {
        const items = new Array<ScaleItemInfo>();
        const endRangeTime = this.range.end.getTime();
        let itemStartDate = this.range.start;
        let itemStartPos = 0;
        let lastBottomIndex = 0;

        while(itemStartDate.getTime() < endRangeTime) {
            const itemNextDate = this.getNextScaleDate(itemStartDate, scaleType);
            const nextDateTime = itemNextDate.getTime();

            for(let i = lastBottomIndex; i < this.bottomScaleItems.length; i++) {
                const item = this.bottomScaleItems[i];
                const startTime = item.start.getTime();
                const endTime = item.end.getTime();
                const isNextDateInItem = nextDateTime >= startTime && nextDateTime <= endTime;
                if(isNextDateInItem) {
                    const itemEndPos = (nextDateTime - startTime) / (endTime - startTime) * item.size.width + item.position.x;
                    items.push(new ScaleItemInfo(itemStartDate, itemNextDate, new Point(itemStartPos, undefined), new Size(itemEndPos - itemStartPos, 0)));
                    lastBottomIndex = i;
                    itemStartPos = itemEndPos;
                    itemStartDate = itemNextDate;
                    break;
                }
            }
        }
        return items;
    }
    getDateInScale(pos: number): Date {
        for(let i = 0; i < this.bottomScaleItems.length; i++) {
            const item = this.bottomScaleItems[i];
            const width = item.size.width;
            const left = item.position.x;
            if(pos >= left && pos <= left + width) {
                const startTime = item.start.getTime();
                const endTime = item.end.getTime();
                const timeOffset = (pos - left) / width * (endTime - startTime);
                return new Date(item.start.getTime() + timeOffset);
            }
        }
        return new Date(this.range.end);
    }
    protected getNextScaleDate(start: Date, scaleType: ViewType): Date {
        let date: Date;
        switch(scaleType) {
            case ViewType.TenMinutes:
                date = this.getNextDateInTenMinutesScale(start);
                break;
            case ViewType.Hours:
                date = this.getNextDateInHoursScale(start);
                break;
            case ViewType.SixHours:
                date = this.getNextDateInSixHoursScale(start);
                break;
            case ViewType.Days:
                date = this.getNextDateInDaysScale(start);
                break;
            case ViewType.Weeks:
                date = this.getNextDateInWeeksScale(start, this.firstDayOfWeek);
                break;
            case ViewType.Months:
                date = this.getNextDateInMonthsScale(start);
                break;
            case ViewType.Quarter:
                date = this.getNextDateInQuartersScale(start);
                break;
            case ViewType.Years:
                date = this.getNextDateInYearsScale(start);
                break;
            case ViewType.FiveYears:
                date = this.getNextDateInFiveYearsScale(start);
                break;
        }
        if(date.getTime() > this.range.end.getTime())
            date = this.range.end;
        return date;
    }
    protected getNextTimeBySpan(value: number, span: number): number {
        const k = Math.trunc(value / span);
        return (k + 1) * span;
    }
    getNextDateInTenMinutesScale(date: Date): Date {
        const minutes = this.getNextTimeBySpan(date.getMinutes(), 10);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), minutes);
    }
    getNextDateInHoursScale(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + 1);
    }
    getNextDateInSixHoursScale(date: Date): Date {
        const hours = this.getNextTimeBySpan(date.getHours(), 6);
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours);
    }
    getNextDateInDaysScale(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    getNextDateInWeeksScale(date: Date, firstDayOfWeek: number = 0): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + firstDayOfWeek + 7);
    }
    getNextDateInMonthsScale(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth() + 1, 1);
    }
    getNextDateInQuartersScale(date: Date): Date {
        const months = this.getNextTimeBySpan(date.getMonth(), 3);
        return new Date(date.getFullYear(), months, 1);
    }
    getNextDateInYearsScale(date: Date): Date {
        return new Date(date.getFullYear() + 1, 0, 1);
    }
    getNextDateInFiveYearsScale(date: Date): Date {
        const years = this.getNextTimeBySpan(date.getFullYear(), 5);
        return new Date(years, 0, 1);
    }
    getAdjustedBottomScaleItemStart(date: Date, viewType: ViewType, firstDayOfWeek: number = 0): Date {
        switch(viewType) {
            case ViewType.TenMinutes:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), Math.floor(date.getMinutes() / 10) * 10);
            case ViewType.SixHours:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(date.getHours() / 6) * 6);
            case ViewType.Hours:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
            case ViewType.Days:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            case ViewType.Weeks:
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + firstDayOfWeek);
            case ViewType.Months:
                return new Date(date.getFullYear(), date.getMonth(), 1);
            case ViewType.Quarter:
                return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
            case ViewType.Years:
                return new Date(date.getFullYear(), 0, 1);
            default:
                return new Date();
        }
    }

    protected calculateScaleWidth(): number {
        return this.bottomScaleItems.reduce((sum, item) => sum += item.size.width, 0);
    }

    public getScaleItemColSpan(scaleType: ViewType): number {
        if(scaleType.valueOf() === this.viewType.valueOf())
            return 1;
        if(this.viewType === ViewType.TenMinutes)
            return 6;
        if(this.viewType === ViewType.Hours)
            return 24;
        if(this.viewType === ViewType.SixHours)
            return 4;
        if(this.viewType === ViewType.Days)
            return 7;
        if(this.viewType === ViewType.Weeks)
            return 4.29;
        if(this.viewType === ViewType.Months)
            return 12;
        if(this.viewType === ViewType.Quarter)
            return 4;
        if(this.viewType === ViewType.Years)
            return 5;
        return 1;
    }
    public getRangeTickCount(start: Date, end: Date): number {
        return DateUtils.getRangeTickCount(start, end, this.viewType);
    }
}
