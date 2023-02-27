import { DiagramModel } from "../Model/Model";
import { EventDispatcher } from "../Utils";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { InputPosition } from "./InputPosition";
import { ItemKey, DiagramItem } from "../Model/DiagramItem";
import { Shape } from "../Model/Shapes/Shape";
import { Connector } from "../Model/Connectors/Connector";
import { Data } from "../Utils/Data";

export class Selection {
    model: DiagramModel;
    inputPosition: InputPosition;
    onChanged: EventDispatcher<ISelectionChangesListener> = new EventDispatcher();

    private keys: ItemKey[];

    constructor(model: DiagramModel) {
        this.inputPosition = new InputPosition(this);
        this.onChanged.add(this.inputPosition);
        this.initialize(model);
    }

    initialize(model: DiagramModel) {
        this.model = model;
        this.keys = [];
        this.inputPosition.initialize();
    }

    add(key: ItemKey) {
        if(this.keys.indexOf(key) < 0) { 
            this.keys.push(key);
            this.raiseSelectionChanged();
        }
    }
    remove(key: ItemKey) {
        if(this.keys.indexOf(key) >= 0) { 
            this.keys.splice(this.keys.indexOf(key), 1);
            this.raiseSelectionChanged();
        }
    }
    clear() {
        if(this.keys.length > 0) {
            this.keys = [];
            this.raiseSelectionChanged();
        }
    }
    set(keys: ItemKey[], forceChange?: boolean) {
        if(forceChange || !Data.ArrayEqual(keys, this.keys)) {
            this.keys = keys;
            this.raiseSelectionChanged();
        }
    }
    getKeys(): ItemKey[] {
        return this.keys;
    }
    getKey(index: number) {
        return this.keys[index];
    }
    private getSelectedItemsInsideContainers(items: DiagramItem[]): DiagramItem[] {
        const result = items.slice();
        items.forEach(item => {
            if(item instanceof Shape) {
                const children = this.getSelectedItemsInsideContainers(this.model.getChildren(item));
                children.forEach(child => {
                    if(result.indexOf(child) === -1 && !this.hasKey(child.key))
                        result.push(child);
                });
            }
        });
        return result;
    }
    getSelectedItemsCore(includeLocked?: boolean) {
        return this.keys.map(key => this.model.findItem(key))
            .filter(item => item && (includeLocked || !item.isLocked));
    }
    getSelectedItems(includeLocked?: boolean, includeInsideContainers?: boolean) {
        if(includeInsideContainers)
            return this.getSelectedItemsInsideContainers(this.getSelectedItemsCore(includeLocked));
        return this.getSelectedItemsCore(includeLocked);
    }
    getSelectedShapes(includeLocked?: boolean, includeInsideContainers?: boolean): Shape[] {
        if(includeInsideContainers) {
            const items = this.getSelectedItemsCore(includeLocked);
            return this.getSelectedItemsInsideContainers(items)
                .map(item => item instanceof Shape ? item : undefined)
                .filter(shape => shape);
        }
        else
            return this.keys.map(key => this.model.findShape(key))
                .filter(shape => shape && (includeLocked || !shape.isLocked));
    }
    getSelectedConnectors(includeLocked?: boolean, includeInsideContainers?: boolean): Connector[] {
        if(includeInsideContainers) {
            const items = this.keys.map(key => this.model.findItem(key));
            return this.getSelectedItemsInsideContainers(items)
                .map(item => item instanceof Connector ? item : undefined)
                .filter(connector => connector && (includeLocked || !connector.isLocked));
        }
        else
            return this.keys.map(key => this.model.findConnector(key))
                .filter(conn => conn && (includeLocked || !conn.isLocked));
    }
    hasKey(key: ItemKey) {
        return this.keys.indexOf(key) >= 0;
    }
    isEmpty(includeLocked?: boolean): boolean {
        return !this.getSelectedItems(includeLocked).length;
    }

    selectRect(rect: Rectangle) {
        const keys: ItemKey[] = [];
        this.model.iterateItems(item => {
            if(item.intersectedByRect(rect))
                keys.push(item.key);
        });
        this.set(keys);
    }

    raiseSelectionChanged() {
        this.onChanged.raise("notifySelectionChanged", this);
    }
}

export interface ISelectionChangesListener {
    notifySelectionChanged(selection: Selection);
}
