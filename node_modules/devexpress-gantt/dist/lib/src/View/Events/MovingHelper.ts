import { Browser } from "@devexpress/utils/lib/browser";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { ITaskAreaContainer } from "../../Interfaces/ITaskAreaContainer";

export class GanttMovingHelper {
    taskAreaContainer: ITaskAreaContainer;
    movingInfo: any;

    constructor(taskAreaContainer: ITaskAreaContainer) {
        this.taskAreaContainer = taskAreaContainer;
        this.movingInfo = null;
    }

    startMoving(e): void {
        this.movingInfo = this.calcMovingInfo(e);
        this.updateGanttAreaCursor(true);
    }
    cancelMoving(): void {
        this.movingInfo = null;
    }
    onMouseMove(e): void {
        this.move(e);
    }
    onMouseUp(e): void {
        this.cancelMoving();
        this.updateGanttAreaCursor(false);
    }
    move(e): void {
        this.updateScrollPosition(e);
    }
    updateScrollPosition(e): void {
        const newEventX = Math.round(EvtUtils.getEventX(e));
        const newEventY = Math.round(EvtUtils.getEventY(e));
        let deltaX = newEventX - this.movingInfo.eventX;
        let deltaY = newEventY - this.movingInfo.eventY;

        const dirX = deltaX < 0 ? -1 : 1;
        const dirY = deltaY < 0 ? -1 : 1;

        const maxDeltaX = dirX < 0 ? this.movingInfo.maxRightDelta : this.movingInfo.maxLeftDelta;
        const maxDeltaY = dirY < 0 ? this.movingInfo.maxBottomDelta : this.movingInfo.maxTopDelta;

        if(Math.abs(deltaX) > maxDeltaX)
            deltaX = maxDeltaX * dirX;
        if(Math.abs(deltaY) > maxDeltaY)
            deltaY = maxDeltaY * dirY;
        const newScrollLeft = this.movingInfo.scrollLeft - deltaX;
        const newScrollTop = this.movingInfo.scrollTop - deltaY;
        const taskAreaContainer = this.taskAreaContainer;
        if(taskAreaContainer.scrollLeft !== newScrollLeft)
            taskAreaContainer.scrollLeft = newScrollLeft;
        if(taskAreaContainer.scrollTop !== newScrollTop)
            taskAreaContainer.scrollTop = newScrollTop;
    }
    calcMovingInfo(e): any {
        const taskAreaContainer = this.taskAreaContainer;
        return {
            eventX: EvtUtils.getEventX(e),
            eventY: EvtUtils.getEventY(e),
            scrollLeft: taskAreaContainer.scrollLeft,
            scrollTop: taskAreaContainer.scrollTop,
            maxLeftDelta: taskAreaContainer.scrollLeft,
            maxRightDelta: taskAreaContainer.scrollWidth - taskAreaContainer.scrollLeft - taskAreaContainer.getElement().offsetWidth,
            maxTopDelta: taskAreaContainer.scrollTop,
            maxBottomDelta: taskAreaContainer.scrollHeight - taskAreaContainer.scrollTop - taskAreaContainer.getElement().offsetHeight
        };
    }
    updateGanttAreaCursor(drag): void {
        const moveCursor = Browser.IE ? "move" : "grabbing";
        this.taskAreaContainer.getElement().style.cursor = drag ? moveCursor : "default";
    }
}
