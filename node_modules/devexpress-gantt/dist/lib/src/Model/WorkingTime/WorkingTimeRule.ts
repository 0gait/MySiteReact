import { DataObject } from "../Entities/DataObject";
import { RecurrenceBase } from "./Recurrence/RecurrenceBase";
import { TimeRange } from "./TimeRange";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DateTimeUtils } from "./DateTimeUtils";
import { RecurrenceFactory } from "./Recurrence/RecurrenceFactory";
import { Daily } from "./Recurrence/Daily";

export class WorkingTimeRule extends DataObject {
    recurrence: RecurrenceBase;
    isWorkDay: boolean = true;
    workTimeRanges: Array<TimeRange> = new Array<TimeRange>();

    constructor(recurrence: RecurrenceBase = null, isWorkDay: boolean = true, workTimeRanges: Array<TimeRange> = null) {
        super();
        this.recurrence = recurrence;
        this.isWorkDay = isWorkDay;
        if(workTimeRanges)
            this.workTimeRanges.concat(workTimeRanges);
    }

    assignFromObject(sourceObj: any): void {
        if(isDefined(sourceObj)) {
            super.assignFromObject(sourceObj);
            this.recurrence = RecurrenceFactory.createRecurrenceByType(sourceObj.recurrenceType) || new Daily();
            if(isDefined(sourceObj.recurrence))
                this.recurrence.assignFromObject(sourceObj.recurrence);
            if(isDefined(sourceObj.isWorkDay))
                this.isWorkDay = !!sourceObj.isWorkDay;
            const ranges = DateTimeUtils.convertToTimeRanges(sourceObj.workTimeRanges);
            if(ranges)
                this.workTimeRanges = ranges;

        }
    }
}
