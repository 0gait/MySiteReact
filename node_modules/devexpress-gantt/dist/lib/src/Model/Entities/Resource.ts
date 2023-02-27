import { isDefined } from "@devexpress/utils/lib/utils/common";
import { DataObject } from "./DataObject";


export class Resource extends DataObject {
    text: string;
    color: string;

    constructor() {
        super();
        this.text = "";
        this.color = "";
    }

    assignFromObject(sourceObj: any): void {
        if(isDefined(sourceObj)) {
            super.assignFromObject(sourceObj);
            this.text = sourceObj.text as string;
            if(isDefined(sourceObj.color))
                this.color = sourceObj.color as string;
        }
    }
}
