import { RecurrenceBase } from "./RecurrenceBase";
import { DateTimeUtils } from "../DateTimeUtils";

export class Daily extends RecurrenceBase {
    checkDate(date: Date): boolean { return true; }

    checkInterval(date: Date): boolean {
        return DateTimeUtils.getDaysBetween(this.start, date) % this.interval == 0;
    }

    calculatePointByInterval(date: Date): Date {
        let daysToAdd = this.interval;
        if(!this.isRecurrencePoint(date))
            daysToAdd -= DateTimeUtils.getDaysBetween(this.start, date) % this.interval;
        return DateTimeUtils.addDays(date, daysToAdd);
    }

    calculateNearestPoint(date: Date): Date {
        return DateTimeUtils.addDays(date, 1);
    }
}
