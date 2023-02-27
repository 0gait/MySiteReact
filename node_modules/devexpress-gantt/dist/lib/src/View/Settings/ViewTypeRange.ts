import { isDefined } from "@devexpress/utils/lib/utils/common";
import { ViewType } from "../Helpers/Enums";

export class ViewTypeRangeSettings {
    min: ViewType = ViewType.TenMinutes;
    max: ViewType = ViewType.Years;


    static parse(settings: any): ViewTypeRangeSettings {
        const result = new ViewTypeRangeSettings();
        if(settings) {
            if(isDefined(settings.min))
                result.min = settings.min;
            if(isDefined(settings.max))
                result.max = settings.max;
        }
        return result;
    }
    equal(settings: ViewTypeRangeSettings): boolean {
        let result = true;
        result = result && this.min === settings.min;
        result = result && this.max === settings.max;

        return result;
    }
}
