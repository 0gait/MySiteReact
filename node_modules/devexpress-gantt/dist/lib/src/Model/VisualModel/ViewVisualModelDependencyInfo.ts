import { DependencyType } from "../Entities/Enums";
import { ViewVisualModelItem } from "./ViewVisualModelItem";

export class ViewVisualModelDependencyInfo {
    constructor(public id: string, public predecessor: ViewVisualModelItem, public type: DependencyType) { }
}
