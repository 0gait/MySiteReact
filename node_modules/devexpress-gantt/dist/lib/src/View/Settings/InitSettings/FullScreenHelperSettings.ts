import { isDefined } from "@devexpress/utils/lib/utils/common";

export class FullScreenHelperSettings {
    getMainElement: () => HTMLElement;
    adjustControl: () => void

    static parse(settings: any): FullScreenHelperSettings {
        const result = new FullScreenHelperSettings();
        if(settings) {
            if(isDefined(settings.getMainElement))
                result.getMainElement = settings.getMainElement;
            if(isDefined(settings.adjustControl))
                result.adjustControl = settings.adjustControl;
        }
        return result;
    }
}
