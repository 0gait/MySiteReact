import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { ViewVisualModelItem } from "../../Model/VisualModel/ViewVisualModelItem";
import { ViewType } from "../Helpers/Enums";
import { DateUtils } from "./DateUtils";
import { ElementTextHelperCultureInfo } from "./ElementTextHelperCultureInfo";

export class ElementTextHelper {
    startTime: number;
    viewType: ViewType;
    modelItems: Array<ViewVisualModelItem>;
    textMeasureContext: CanvasRenderingContext2D;
    longestAbbrMonthName: string = null;
    longestMonthName: string = null;
    longestAbbrDayName: string = null;
    cultureInfo: ElementTextHelperCultureInfo;
    constructor(cultureInfo: ElementTextHelperCultureInfo) {
        const canvas = document.createElement("canvas");
        this.textMeasureContext = canvas.getContext("2d");
        this.cultureInfo = cultureInfo;
    }
    setFont(fontHolder: HTMLElement): void {
        const computedStyle = DomUtils.getCurrentStyle(fontHolder);
        const font = computedStyle.font ? computedStyle.font :
            computedStyle.fontStyle + " " + computedStyle.fontVariant + " " + computedStyle.fontWeight + " "
            + computedStyle.fontSize + " / " + computedStyle.lineHeight + " " + computedStyle.fontFamily;
        this.textMeasureContext.font = font;
    }
    setSettings(startTime: number, viewType: ViewType, modelItems: Array<ViewVisualModelItem>): void {
        this.startTime = startTime;
        this.viewType = viewType;
        this.modelItems = modelItems;
    }
    getScaleItemText(date: Date, scaleType: ViewType) : string {
        const isViewTypeScale = this.viewType.valueOf() === scaleType.valueOf();
        switch(scaleType) {
            case ViewType.TenMinutes:
                return this.getTenMinutesScaleItemText(date);
            case ViewType.Hours:
            case ViewType.SixHours:
                return this.getHoursScaleItemText(date);
            case ViewType.Days:
                return this.getDaysScaleItemText(date, isViewTypeScale);
            case ViewType.Weeks:
                return this.getWeeksScaleItemText(date, isViewTypeScale);
            case ViewType.Months:
                return this.getMonthsScaleItemText(date, isViewTypeScale);
            case ViewType.Quarter:
                return this.getQuarterScaleItemText(date, isViewTypeScale);
            case ViewType.Years:
                return this.getYearsScaleItemText(date);
            case ViewType.FiveYears:
                return this.getFiveYearsScaleItemText(date);
        }
    }
    getTenMinutesScaleItemText(scaleItemDate: Date): string {
        const minutes = scaleItemDate.getMinutes() + 1;
        return (Math.ceil(minutes / 10) * 10).toString();
    }
    getThirtyMinutesScaleItemText(scaleItemDate: Date): string {
        const minutes = scaleItemDate.getMinutes();
        return minutes < 30 ? "30" : "60";
    }
    getHoursScaleItemText(scaleItemDate: Date): string {
        const hours = scaleItemDate.getHours();
        const hourDisplayText = this.getHourDisplayText(hours);
        const amPmText = hours < 12 ? this.getAmText() : this.getPmText();
        return this.getHoursScaleItemTextCore(hourDisplayText, amPmText);
    }
    getDaysScaleItemText(scaleItemDate: Date, isViewTypeScale: boolean): string {
        return this.getDayTotalText(scaleItemDate, true, isViewTypeScale, isViewTypeScale, !isViewTypeScale);
    }
    getWeeksScaleItemText(scaleItemDate: Date, isViewTypeScale: boolean): string {
        const weekLastDayDate = DateUtils.getDSTCorrectedTaskEnd(scaleItemDate, DateUtils.msPerWeek - DateUtils.msPerDay);
        return this.getWeeksScaleItemTextCore(
            this.getDayTotalText(scaleItemDate, isViewTypeScale, true, isViewTypeScale, !isViewTypeScale),
            this.getDayTotalText(weekLastDayDate, isViewTypeScale, true, isViewTypeScale, !isViewTypeScale)
        );
    }
    getMonthsScaleItemText(scaleItemDate: Date, isViewTypeScale: boolean): string {
        const monthNames = this.getMonthNames();
        const yearDisplayText = !isViewTypeScale ? scaleItemDate.getFullYear().toString() : "";
        return this.getMonthsScaleItemTextCore(monthNames[scaleItemDate.getMonth()], yearDisplayText);
    }
    getQuarterScaleItemText(scaleItemDate: Date, isViewTypeScale: boolean): string {
        const quarterNames = this.getQuarterNames();
        const yearDisplayText = !isViewTypeScale ? scaleItemDate.getFullYear().toString() : "";
        return this.getMonthsScaleItemTextCore(quarterNames[Math.floor(scaleItemDate.getMonth() / 3)], yearDisplayText);
    }
    getYearsScaleItemText(scaleItemDate: Date): string {
        return scaleItemDate.getFullYear().toString();
    }
    getFiveYearsScaleItemText(scaleItemDate: Date): string {
        return scaleItemDate.getFullYear().toString() + " - " + (scaleItemDate.getFullYear() + 4).toString();
    }
    getHourDisplayText(hours: number): string {
        if(this.hasAmPm())
            return (hours == 0 ? 12 : (hours <= 12 ? hours : hours - 12)).toString();
        return hours < 10 ? "0" + hours : hours.toString();
    }
    getDayTotalText(scaleItemDate: Date, displayDayName: boolean, useAbbrDayNames: boolean, useAbbrMonthNames: boolean, displayYear: boolean): string {
        const monthNames = useAbbrMonthNames ? this.getAbbrMonthNames() : this.getMonthNames();
        const dayNames = useAbbrDayNames ? this.getAbbrDayNames() : this.getDayNames();
        const dayNameDisplayText = displayDayName ? dayNames[scaleItemDate.getDay()] : "";
        const day = scaleItemDate.getDate();
        const monthName = monthNames[scaleItemDate.getMonth()];
        const yearDisplayText = displayYear ? scaleItemDate.getFullYear().toString() : "";
        return this.getDayTotalTextCore(dayNameDisplayText, day.toString(), monthName, yearDisplayText);
    }
    getTaskText(index: number): string {
        const item = this.modelItems[index];
        return item ? item.task.title : "";
    }
    getTaskVisibility(index: number): boolean {
        const item = this.modelItems[index];
        return !!item && item.getVisible();
    }
    hasAmPm(): boolean {
        return this.getAmText().length > 0 || this.getPmText().length > 0;
    }
    getScaleItemTextTemplate(viewType: ViewType): string {
        switch(viewType) {
            case ViewType.TenMinutes:
                return "00";
            case ViewType.Hours:
            case ViewType.SixHours:
                return this.getHoursScaleItemTextCore("00", this.getAmText());
            case ViewType.Days:
                return this.getDayTextTemplate();
            case ViewType.Weeks:
                return this.getWeekTextTemplate();
            case ViewType.Months:
                return this.getMonthsScaleItemTextCore(this.getLongestMonthName(), "");
            case ViewType.Quarter:
                return "Q4";
            case ViewType.Years:
                return "0000";
        }
    }
    getDayTextTemplate(): string {
        return this.getDayTotalTextCore(this.getLongestAbbrDayName(), "00", this.getLongestAbbrMonthName(), "");
    }
    getWeekTextTemplate(): string {
        const dayTextTemplate = this.getDayTextTemplate();
        return this.getWeeksScaleItemTextCore(dayTextTemplate, dayTextTemplate);
    }
    getHoursScaleItemTextCore(hourDisplayText: string, amPmText: string): string {
        return hourDisplayText + ":00" + (this.hasAmPm() ? " " + amPmText : "");
    }
    getDayTotalTextCore(dayName: string, dayValueString: string, monthName: string, yearValueString: string): string {
        let result = dayName.length > 0 ? dayName + ", " : "";
        result += dayValueString + " " + monthName;
        result += yearValueString.length > 0 ? " " + yearValueString : "";
        return result;
    }
    getWeeksScaleItemTextCore(firstDayOfWeekString: string, lastDayOfWeekString: string): string {
        return firstDayOfWeekString + " - " + lastDayOfWeekString;
    }
    getMonthsScaleItemTextCore(monthName: string, yearValueString: string): string {
        let result = monthName;
        if(yearValueString.length > 0)
            result += " " + yearValueString;
        return result;
    }
    getLongestAbbrMonthName(): string {
        if(this.longestAbbrMonthName == null)
            this.longestAbbrMonthName = this.getLongestText(this.getAbbrMonthNames());
        return this.longestAbbrMonthName;
    }
    getLongestMonthName(): string {
        if(this.longestMonthName == null)
            this.longestMonthName = this.getLongestText(this.getMonthNames());
        return this.longestMonthName;
    }
    getLongestAbbrDayName(): string {
        if(this.longestAbbrDayName == null)
            this.longestAbbrDayName = this.getLongestText(this.getAbbrDayNames());
        return this.longestAbbrDayName;
    }
    getLongestText(texts: Array<string>): string {
        let result = "";
        let longestTextWidth = 0;
        texts.forEach(text => {
            const textWidth = this.getTextWidth(text);
            if(textWidth > longestTextWidth) {
                longestTextWidth = textWidth;
                result = text;
            }
        });
        return result;
    }
    getTextWidth(text: string): number {
        return Math.round(this.textMeasureContext.measureText(text).width);
    }
    getAmText(): string {
        return this.cultureInfo.amText;
    }
    getPmText(): string {
        return this.cultureInfo.pmText;
    }
    getQuarterNames(): string[] {
        return this.cultureInfo.quarterNames;
    }
    getMonthNames(): string[] {
        return this.cultureInfo.monthNames;
    }
    getDayNames(): string[] {
        return this.cultureInfo.dayNames;
    }
    getAbbrMonthNames(): string[] {
        return this.cultureInfo.abbrMonthNames;
    }
    getAbbrDayNames(): string[] {
        return this.cultureInfo.abbrDayNames;
    }
}
