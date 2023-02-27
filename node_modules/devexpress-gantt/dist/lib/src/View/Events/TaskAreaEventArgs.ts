import { isDefined } from "@devexpress/utils/lib/utils/common";

export class TaskAreaEventArgs {
    public eventName: string;
    public triggerEvent: Event;
    public rowIndex: number = -1;

    public info: Record<string, any> = { };

    constructor(eventName: string, evt?: Event, rowIndex?: number, info?: Record<string, any>) {
        this.eventName = eventName;
        this.triggerEvent = evt;
        if(isDefined(rowIndex))
            this.rowIndex = rowIndex;
        if(info)
            this.info = info;
    }
}
