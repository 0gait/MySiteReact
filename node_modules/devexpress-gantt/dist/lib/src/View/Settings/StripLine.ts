import { isDefined } from "@devexpress/utils/lib/utils/common";

export class StripLine {
    start: Date | (() => Date);
    end: Date | (() => Date);
    title: string;
    cssClass: string;
    isCurrent: boolean = false;

    constructor(start?: Date | (() => Date), end?: Date | (() => Date), title?: string, cssClass?: string, isCurrent?: boolean) {
        this.start = start;
        this.end = end;
        this.title = title;
        this.cssClass = cssClass;
        this.isCurrent = isCurrent;
    }

    static parse(settings: any): StripLine {
        const result = new StripLine();
        if(settings) {
            if(isDefined(settings.start))
                result.start = settings.start;
            if(isDefined(settings.end))
                result.end = settings.end;
            if(isDefined(settings.title))
                result.title = settings.title;
            if(isDefined(settings.cssClass))
                result.cssClass = settings.cssClass;
        }
        return result;
    }

    clone(): StripLine {
        return new StripLine(this.start, this.end, this.title, this.cssClass, this.isCurrent);
    }

    equal(stripLine: StripLine): boolean {
        let result = true;
        result = result && this.start == stripLine.start;
        result = result && this.end == stripLine.end;
        result = result && this.title == stripLine.title;
        result = result && this.cssClass == stripLine.cssClass;
        return result;
    }
}
