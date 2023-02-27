import { isDefined } from "@devexpress/utils/lib/utils/common";
import { MathUtils } from "@devexpress/utils/lib/utils/math";

export abstract class DataObject {
    id: any;
    internalId: string;

    constructor() {
        this.internalId = MathUtils.generateGuid();
    }

    assignFromObject(sourceObj: any): void {
        if(!isDefined(sourceObj))
            return;

        if(isDefined(sourceObj.id))
            this.updateId(sourceObj.id);
    }
    public updateId(newKey: any): void {
        this.id = newKey;
        this.internalId = String(newKey);
    }
}

export const GanttDataObjectNames = {
    task: "task",
    dependency: "dependency",
    resource: "resource",
    resourceAssignment: "assignment"
};

