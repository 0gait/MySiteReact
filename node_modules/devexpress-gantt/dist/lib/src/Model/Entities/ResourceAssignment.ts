import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DataObject } from "./DataObject";

export class ResourceAssignment extends DataObject {
    taskId: string;
    resourceId: string;

    constructor() {
        super();
        this.taskId = "";
        this.resourceId = "";
    }

    assignFromObject(sourceObj: any): void {
        if(isDefined(sourceObj)) {
            super.assignFromObject(sourceObj);
            this.taskId = String(sourceObj.taskId);
            this.resourceId = String(sourceObj.resourceId);
        }
    }
}
