import { isDefined } from "@devexpress/utils/lib/utils/common";
import { StripLine } from "./StripLine";

export class StripLineSettings {
    showCurrentTime: boolean = false;
    currentTimeUpdateInterval: number = 60000;
    currentTimeTitle: string;
    currentTimeCssClass: string;
    stripLines: Array<StripLine> = [];

    static parse(settings: any): StripLineSettings {
        const result = new StripLineSettings();
        if(settings) {
            if(isDefined(settings.showCurrentTime))
                result.showCurrentTime = settings.showCurrentTime;
            if(isDefined(settings.currentTimeUpdateInterval))
                result.currentTimeUpdateInterval = settings.currentTimeUpdateInterval;
            if(isDefined(settings.currentTimeTitle))
                result.currentTimeTitle = settings.currentTimeTitle;
            if(isDefined(settings.currentTimeCssClass))
                result.currentTimeCssClass = settings.currentTimeCssClass;

            if(isDefined(settings.stripLines))
                for(let i = 0; i < settings.stripLines.length; i++)
                    result.stripLines.push(StripLine.parse(settings.stripLines[i]));
        }
        return result;
    }
    equal(settings: StripLineSettings): boolean {
        let result = true;
        result = result && this.showCurrentTime == settings.showCurrentTime;
        result = result && this.currentTimeUpdateInterval == settings.currentTimeUpdateInterval;
        result = result && this.currentTimeTitle == settings.currentTimeTitle;
        result = result && this.currentTimeCssClass == settings.currentTimeCssClass;
        result = result && this.stripLines.length === settings.stripLines.length;
        if(result)
            for(let i = 0; i < settings.stripLines.length; i++)
                result = result && this.stripLines[i].equal(settings.stripLines[i]);

        return result;
    }
}
