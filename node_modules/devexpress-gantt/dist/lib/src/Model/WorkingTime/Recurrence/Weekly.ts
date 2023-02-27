import { RecurrenceBase } from "./RecurrenceBase";
import { DateTimeUtils } from "../DateTimeUtils";
import { DayOfWeek } from "../DayOfWeek";

export class Weekly extends RecurrenceBase {
    checkDate(date: Date): boolean {
        return DateTimeUtils.checkDayOfWeek(this.dayOfWeekInternal, date);
    }

    checkInterval(date: Date): boolean {
        return DateTimeUtils.getWeeksBetween(this.start, date) % this.interval == 0;
    }

    calculatePointByInterval(date: Date): Date {
        const weeksFromStart = DateTimeUtils.getWeeksBetween(this.start, date);
        let intervalCount = Math.floor(weeksFromStart / this.interval);
        const remainder = weeksFromStart % this.interval;
        const isPointOnNewWeek = remainder > 0 || date.getDay() >= this.dayOfWeekInternal;
        if(isPointOnNewWeek)
            intervalCount++;
        const weeksToAdd = intervalCount * this.interval;
        return this.calcNextPointWithWeekCount(this.start, weeksToAdd);
    }

    calculateNearestPoint(date: Date): Date {
        const diff = this.dayOfWeekInternal - date.getDay();
        if(diff > 0)
            return DateTimeUtils.addDays(new Date(date), diff);
        return this.calcNextPointWithWeekCount(date, 1);
    }

    calcNextPointWithWeekCount(date: Date, weekCount: number = 1) {
        const daysToAdd = weekCount * 7 + this.dayOfWeekInternal - date.getDay();
        return DateTimeUtils.addDays(new Date(date), daysToAdd);
    }

    public get dayOfWeek(): DayOfWeek { return this.dayOfWeekInternal; }
    public set dayOfWeek(value: DayOfWeek) { this.dayOfWeekInternal = value; }
}
