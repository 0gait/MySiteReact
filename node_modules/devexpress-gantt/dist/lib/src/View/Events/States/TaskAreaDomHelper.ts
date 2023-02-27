import { DomUtils } from "@devexpress/utils/lib/utils/dom";
import { EvtUtils } from "@devexpress/utils/lib/utils/evt";
import { TaskEditController } from "../../Edit/TaskEditController";
import { TaskAreaEventSource } from "../../Helpers/Enums";
import { GridLayoutCalculator } from "../../Helpers/GridLayoutCalculator";

export class TaskAreaDomHelper {
    public static getEventSource(initSource: HTMLElement): TaskAreaEventSource {
        const source: HTMLElement = initSource.nodeType === window?.Node?.ELEMENT_NODE ? initSource : <HTMLElement>initSource.parentNode;
        const className: string = source.classList[0];
        return TaskAreaDomHelper.classToSource[className] || TaskAreaEventSource.TaskArea;
    }
    public static classToSource: { [className: string]: TaskAreaEventSource } = {
        [TaskEditController.CLASSNAMES.TASK_EDIT_PROGRESS]: TaskAreaEventSource.TaskEdit_Progress,
        [TaskEditController.CLASSNAMES.TASK_EDIT_START]: TaskAreaEventSource.TaskEdit_Start,
        [TaskEditController.CLASSNAMES.TASK_EDIT_END]: TaskAreaEventSource.TaskEdit_End,
        [TaskEditController.CLASSNAMES.TASK_EDIT_FRAME]: TaskAreaEventSource.TaskEdit_Frame,
        [TaskEditController.CLASSNAMES.TASK_EDIT_DEPENDENCY_RIGTH]: TaskAreaEventSource.TaskEdit_DependencyStart,
        [TaskEditController.CLASSNAMES.TASK_EDIT_DEPENDENCY_LEFT]: TaskAreaEventSource.TaskEdit_DependencyFinish,
        [TaskEditController.CLASSNAMES.TASK_EDIT_SUCCESSOR_DEPENDENCY_RIGTH]: TaskAreaEventSource.Successor_DependencyStart,
        [TaskEditController.CLASSNAMES.TASK_EDIT_SUCCESSOR_DEPENDENCY_LEFT]: TaskAreaEventSource.Successor_DependencyFinish
    }
    public static isConnectorLine(evt: Event): boolean {
        const source = EvtUtils.getEventSource(evt);
        return DomUtils.hasClassName(source, GridLayoutCalculator.CLASSNAMES.CONNECTOR_HORIZONTAL) ||
        DomUtils.hasClassName(source, GridLayoutCalculator.CLASSNAMES.CONNECTOR_VERTICAL);
    }
    public static isTaskElement(evt: Event): boolean {
        const sourceElement = EvtUtils.getEventSource(evt);
        const source = TaskAreaDomHelper.classToSource[sourceElement.classList[0]];
        return source === TaskAreaEventSource.TaskEdit_Frame ||
            source === TaskAreaEventSource.TaskEdit_Progress ||
            source === TaskAreaEventSource.TaskEdit_Start ||
            source === TaskAreaEventSource.TaskEdit_End ||
            source === TaskAreaEventSource.TaskEdit_DependencyStart ||
            source === TaskAreaEventSource.TaskEdit_DependencyFinish;
    }
    public static isMouseEvent(evt: Event): boolean { return evt instanceof MouseEvent; }
    public static isTouchEvent(evt: Event): boolean { return window.TouchEvent && (evt instanceof TouchEvent); }
    public static isPointerEvent(evt: Event): boolean { return window.PointerEvent && (evt instanceof PointerEvent); }
    public static isMousePointer(evt: Event): boolean { return this.isPointerEvent(evt) && (evt as PointerEvent).pointerType === "mouse"; }
}
