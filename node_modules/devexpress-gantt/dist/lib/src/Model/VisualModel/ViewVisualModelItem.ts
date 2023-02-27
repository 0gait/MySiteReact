import { Task } from "../Entities/Task";
import { ResourceCollection } from "../Collections/ResourceCollection";
import { ViewVisualModelDependencyInfo } from "./ViewVisualModelDependencyInfo";
import { isDefined } from "@devexpress/utils/lib/utils/common";
import { Size } from "@devexpress/utils/lib/geometry/size";

export class ViewVisualModelItem {
    task: Task;
    resources: ResourceCollection;
    dependencies: Array<ViewVisualModelDependencyInfo> = new Array<ViewVisualModelDependencyInfo>();

    parent: ViewVisualModelItem = null;
    children: Array<ViewVisualModelItem>;
    visible: boolean = true;
    selected: boolean = false;
    visibleIndex: number = -1;
    isCustom: boolean;
    size: Size;

    constructor(task: Task, resources: ResourceCollection) {
        this.task = task;
        this.resources = resources;
        this.children = new Array<ViewVisualModelItem>();
        this.isCustom = false;
        this.size = new Size(0, 0);
    }
    get resourceText(): string {
        let text = "";
        this.resources.items.forEach(r => text += r.text + " ");
        return text;
    }

    addChild(child: ViewVisualModelItem): void {
        if(isDefined(child) && this.children.indexOf(child) < 0)
            this.children.push(child);
    }
    removeChild(child: ViewVisualModelItem): void {
        const index = this.children.indexOf(child);
        if(index > -1)
            this.children.splice(index, 1);
    }

    getExpanded(): boolean {
        return !!this.task && this.task.expanded;
    }
    getVisible(): boolean {
        if(!this.visible)
            return false;

        let parentItem = this.parent;
        while(parentItem) {
            if(!parentItem.visible)
                return false;
            parentItem = parentItem.parent;
        }

        return true;
    }
    changeVisibility(visible: boolean): void {
        this.visible = visible;
    }
    changeSelection(selected: boolean): void {
        this.selected = selected;
    }
    setDependencies(dependencies: Array<ViewVisualModelDependencyInfo>): void {
        if(dependencies)
            this.dependencies = dependencies.slice();
    }
}
