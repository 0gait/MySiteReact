import { Size } from "@devexpress/utils/lib/geometry/size";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { IHistory } from "../../../Model/History/IHistory";
import { ViewVisualModel } from "../../../Model/VisualModel/VisualModel";
import { TaskEditController } from "../../Edit/TaskEditController";
import { RenderHelper } from "../../Render/RenderHelper";

export class HandlerSettings {
    getRenderHelper: () => RenderHelper;
    getTaskEditController: () => TaskEditController;
    getHistory: () => IHistory;
    getTickSize: () => Size;
    isFocus: () => boolean;
    getViewModel: () => ViewVisualModel;
    zoomIn: (leftPosition: number) => void;
    zoomOut: (leftPosition: number) => void;
    selectDependency: (id: string) => void;
    showPopupMenu: (info: any) => void;
    changeGanttTaskSelection: (id: string, selected: boolean) => void;


    static parse(settings: any): HandlerSettings {
        const result = new HandlerSettings();
        if(settings) {
            if(isDefined(settings.getRenderHelper))
                result.getRenderHelper = settings.getRenderHelper;
            if(isDefined(settings.getTaskEditController))
                result.getTaskEditController = settings.getTaskEditController;
            if(isDefined(settings.getHistory))
                result.getHistory = settings.getHistory;
            if(isDefined(settings.getTickSize))
                result.getTickSize = settings.getTickSize;
            if(isDefined(settings.isFocus))
                result.isFocus = settings.isFocus;
            if(isDefined(settings.getViewModel))
                result.getViewModel = settings.getViewModel;
            if(isDefined(settings.zoomIn))
                result.zoomIn = settings.zoomIn;
            if(isDefined(settings.zoomOut))
                result.zoomOut = settings.zoomOut;
            if(isDefined(settings.selectDependency))
                result.selectDependency = settings.selectDependency;
            if(isDefined(settings.showPopupMenu))
                result.showPopupMenu = settings.showPopupMenu;
            if(isDefined(settings.changeGanttTaskSelection))
                result.changeGanttTaskSelection = settings.changeGanttTaskSelection;
        }
        return result;
    }
}
