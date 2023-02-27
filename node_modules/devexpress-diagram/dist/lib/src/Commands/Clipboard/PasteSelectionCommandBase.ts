import { ClipboardCommand } from "./ClipboardCommand";
import { SimpleCommandState } from "../CommandStates";
import { Importer } from "../../ImportAndExport/Importer";
import { Shape } from "../../Model/Shapes/Shape";
import { ImportShapeHistoryItem } from "../../History/Common/ImportShapeHistoryItem";
import { Connector } from "../../Model/Connectors/Connector";
import { ImportConnectorHistoryItem } from "../../History/Common/ImportConnectorHistoryItem";
import { ModelUtils } from "../../Model/ModelUtils";
import { SetSelectionHistoryItem } from "../../History/Common/SetSelectionHistoryItem";
import { DiagramItem } from "../../Model/DiagramItem";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";
import { DiagramModel } from "../../Model/Model";

export abstract class PasteSelectionCommandBase extends ClipboardCommand {
    static readonly positionOffset = UnitConverter.pixelsToTwips(10);

    isEnabled(): boolean {
        return super.isEnabled() && (this.isPasteSupportedByBrowser() || ClipboardCommand.clipboardData !== undefined);
    }
    isVisible(): boolean {
        return this.isPasteSupportedByBrowser() || ClipboardCommand.clipboardData !== undefined;
    }
    parseClipboardData(data: string): DiagramItem[] {
        let items: DiagramItem[] = [];
        const importer = new Importer(this.control.shapeDescriptionManager, data);
        items = importer.importItems(this.control.model);
        let offset = this.getEventPositionOffset(items, this.control.contextMenuPosition);
        offset = this.getCorrectedOffsetByModel(items, offset);
        for(let i = 0; i < items.length; i++) {
            const item = items[i];
            if(item instanceof Shape)
                item.position.offsetByPoint(offset);
            else if(item instanceof Connector)
                item.points.forEach(p => p.offsetByPoint(offset));
        }
        return items;
    }
    protected abstract getEventPositionOffset(items: DiagramItem[], evtPosition?: Point): Point;
    protected getCorrectedOffsetByModel(items: DiagramItem[], baseOffset: Point): Point {
        const { topLeftItem } = items.reduce((acc, item) => {
            const x = item instanceof Shape ? item.position.x : item instanceof Connector ? item.getMinX() : Number.MAX_VALUE;
            const y = item instanceof Shape ? item.position.y : item instanceof Connector ? item.getMinY() : Number.MAX_VALUE;
            if(y < acc.y || (y === acc.y && x < acc.x)) {
                acc.topLeftItem = item;
                acc.x = x;
                acc.y = y;
            }
            return acc;
        }, {
            topLeftItem: items[0],
            x: Number.MAX_VALUE,
            y: Number.MAX_VALUE
        });
        if(topLeftItem instanceof Shape) {
            const newPoint = this.getShapeCorrectedPosition(this.control.model, topLeftItem, baseOffset);
            return new Point(newPoint.x - topLeftItem.position.x, newPoint.y - topLeftItem.position.y);
        }
        else if(topLeftItem instanceof Connector) {
            const newPoints = this.getConnectorCorrectedPoints(this.control.model, topLeftItem, baseOffset);
            return new Point(topLeftItem.points[0].x - newPoints[0].x, topLeftItem.points[0].y - newPoints[0].y);
        }
    }
    executeCore(state: SimpleCommandState, parameter?: string): boolean {
        let ret = true;
        if(parameter)
            this.performPaste(parameter);
        else
            this.getClipboardData(data => {
                ret = this.execute(data); 
            });
        return ret;
    }
    addItemForSortingRecursive(itemsHashtable: {[key: string]: number}, item: DiagramItem): number {
        if(itemsHashtable[item.key])
            return itemsHashtable[item.key];
        if(item instanceof Connector) {
            if(item.endItem)
                itemsHashtable[item.key] = this.addItemForSortingRecursive(itemsHashtable, item.endItem) - 0.5;
            else if(item.beginItem)
                itemsHashtable[item.key] = this.addItemForSortingRecursive(itemsHashtable, item.beginItem) + 0.5;
            else
                itemsHashtable[item.key] = -1;
            return itemsHashtable[item.key];
        }
        if(item.attachedConnectors.length === 0)
            return itemsHashtable[item.key] = 0;
        else
            for(let i = 0; i < item.attachedConnectors.length; i++) {
                const beginItem = item.attachedConnectors[i].beginItem;
                if(item.attachedConnectors[i].endItem === item && beginItem && beginItem !== item.attachedConnectors[i].endItem)
                    return itemsHashtable[item.key] = this.addItemForSortingRecursive(itemsHashtable, beginItem) + 1;
                else
                    return itemsHashtable[item.key] = 0; 
            }
    }
    getSortedPasteItems(items: DiagramItem[]): DiagramItem[] {
        const sortedItems: DiagramItem[] = [];
        const connectors = [];
        const itemsHashtable = {};
        for(let i = 0; i < items.length; i++) {
            const item = items[i];
            if(item instanceof Shape)
                sortedItems.push(item);
            else if(item instanceof Connector) {
                connectors.push(item);
                this.addItemForSortingRecursive(itemsHashtable, item);
            }
        }
        connectors.sort((a, b) => itemsHashtable[b.key] - itemsHashtable[a.key]);
        return sortedItems.concat(connectors);
    }
    performPaste(data: string): void {
        this.control.beginUpdateCanvas();
        this.control.history.beginTransaction();
        const idsForSelection: {[id: string]: boolean} = {};
        let items = this.parseClipboardData(data);
        items = this.getSortedPasteItems(items);
        for(let i = 0; i < items.length; i++) {
            const item = items[i];
            if(item instanceof Shape)
                this.control.history.addAndRedo(new ImportShapeHistoryItem(item));

            else if(item instanceof Connector)
                this.control.history.addAndRedo(new ImportConnectorHistoryItem(item));

            const containerKey = item.container && item.container.key;
            if(!containerKey || idsForSelection[containerKey] === undefined)
                idsForSelection[item.key] = true;
            else if(containerKey && idsForSelection[containerKey] !== undefined)
                idsForSelection[item.key] = false;
        }
        ModelUtils.tryUpdateModelRectangle(this.control.history);
        this.control.history.addAndRedo(new SetSelectionHistoryItem(this.control.selection, Object.keys(idsForSelection).filter(id => idsForSelection[id])));
        this.control.history.endTransaction();
        this.control.endUpdateCanvas();
        this.control.barManager.updateItemsState();
    }
    protected getShapeCorrectedPosition(model: DiagramModel, shape: Shape, initOffset: Point): Point {
        const position = shape.position.clone().offsetByPoint(initOffset);
        while(model.findShapeAtPosition(position))
            position.offset(PasteSelectionCommandBase.positionOffset, PasteSelectionCommandBase.positionOffset);
        return position;
    }
    protected getConnectorCorrectedPoints(model: DiagramModel, connector: Connector, initOffset: Point): Point[] {
        const points = connector.points.map(p => p.clone().offsetByPoint(initOffset));
        while(model.findConnectorAtPoints(points))
            points.forEach(pt => {
                pt.x += PasteSelectionCommandBase.positionOffset;
                pt.y += PasteSelectionCommandBase.positionOffset;
            });
        return points;
    }

    protected get isPermissionsRequired(): boolean { return true; }
}
