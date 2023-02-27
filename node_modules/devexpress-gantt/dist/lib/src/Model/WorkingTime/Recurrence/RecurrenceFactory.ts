import { RecurrenceBase } from "./RecurrenceBase";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { Daily } from "./Daily";
import { Weekly } from "./Weekly";
import { Monthly } from "./Monthly";
import { Yearly } from "./Yearly";

export class RecurrenceFactory {
    static createRecurrenceByType(type: string): RecurrenceBase {
        if(!type) return null;
        const correctedType = type.toLowerCase();
        switch(correctedType) {
            case "daily":
                return new Daily();
            case "weekly":
                return new Weekly();
            case "monthly":
                return new Monthly();
            case "yearly":
                return new Yearly();
        }
        return null;
    }

    static createRecurrenceFromObject(sourceObj: any): RecurrenceBase {
        if(!sourceObj) return null;
        const recurrence = this.createRecurrenceByType(sourceObj.type);
        if(recurrence)
            recurrence.assignFromObject(sourceObj);
        return recurrence;
    }

    static getEnumValue(type: any, value: any): any {
        if(!isDefined(type[value as string|number]))
            return null;
        const num = parseInt(value);
        if(!isNaN(num))
            return num;
        return type[value];
    }
}
