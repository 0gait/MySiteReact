import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DataObject } from "./DataObject";
import { DependencyType } from "./Enums";

export class Dependency extends DataObject {
    predecessorId: string;
    successorId: string;
    type: DependencyType;
    get isStartDependency(): boolean {
        return this.type === DependencyType.SS || this.type === DependencyType.SF;
    }
    constructor() {
        super();
        this.predecessorId = "";
        this.successorId = "";
        this.type = null;
    }

    assignFromObject(sourceObj: any): void {
        if(isDefined(sourceObj)) {
            super.assignFromObject(sourceObj);
            this.predecessorId = String(sourceObj.predecessorId);
            this.successorId = String(sourceObj.successorId);
            this.type = this.parseType(sourceObj.type);
        }
    }

    private parseType(type: any): DependencyType {
        if(isDefined(type)) {
            const text = type.toString().toUpperCase();
            switch(text) {
                case "SS":
                case "1":
                    return DependencyType.SS;
                case "FF":
                case "2":
                    return DependencyType.FF;
                case "SF":
                case "3":
                    return DependencyType.SF;
                default: return DependencyType.FS;
            }
        }
        else
            return DependencyType.FS;
    }
}
