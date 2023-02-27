import { DiagramItem } from "./DiagramItem";

export enum ItemChangeType { Create, UpdateProperties, UpdateStructure, Update, Remove, UpdateClassName }

export class ItemChange {
    constructor(public item: DiagramItem, public type: ItemChangeType, public isValid: boolean = true) { }

    get key(): string { return this.item.key; }
}
