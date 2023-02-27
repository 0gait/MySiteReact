import { DiagramModel } from "../Model/Model";
import { Shape } from "../Model/Shapes/Shape";
import { Connector } from "../Model/Connectors/Connector";
import { DiagramItem } from "../Model/DiagramItem";
import { TextStyle, Style } from "../Model/Style";
import { ShapeDescriptionManager } from "../Model/Shapes/Descriptions/ShapeDescriptionManager";

export abstract class ImporterBase {
    constructor(protected shapeDescriptionManager: ShapeDescriptionManager) {
    }

    import(): DiagramModel {
        const model = new DiagramModel();
        const obj = this.getObject();
        this.importPageSettings(model, this.getPageObject(obj));
        const shapes = this.importShapes(this.getShapeObjects(obj));
        for(let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if(model.findItem(shape.key))
                throw Error("Item key is duplicated");
            model.pushItem(shape);
        }
        const connectors = this.importConnectors(this.getConnectorObjects(obj));
        for(let i = 0; i < connectors.length; i++) {
            const connector = connectors[i];

            connector.endItem = model.findItem(connector["endItemKey"]) || undefined;
            delete connector["endItemKey"];
            connector.beginItem = model.findItem(connector["beginItemKey"]) || undefined;
            delete connector["beginItemKey"];

            if(model.findItem(connector.key))
                throw Error("Item key is duplicated");
            model.pushItem(connector);
            this.updateConnections(connector);
        }
        this.updateChildren(model.items, key => model.findItem(key));
        return model;
    }
    importItems(model: DiagramModel): DiagramItem[] {
        const result: DiagramItem[] = [];
        const obj = this.getObject();
        const itemHash: { [key: string]: DiagramItem } = {};
        const shapes = this.importShapes(this.getShapeObjects(obj));
        let key;
        for(let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];

            const oldKey = shape.key;
            key = model.getNextKey();
            shape.key = key;
            itemHash[oldKey] = shape;

            if(shape.dataKey !== undefined)
                shape.dataKey = undefined;

            result.push(shape);
        }
        const connectors = this.importConnectors(this.getConnectorObjects(obj));
        for(let i = 0; i < connectors.length; i++) {
            const connector = connectors[i];

            const oldKey = connector.key;
            key = model.getNextKey();
            connector.key = key;
            itemHash[oldKey] = connector;

            if(connector.dataKey !== undefined)
                connector.dataKey = undefined;

            const endItemKey = connector["endItemKey"];
            connector.endItem = itemHash[endItemKey];
            delete connector["endItemKey"];

            const beginItemKey = connector["beginItemKey"];
            connector.beginItem = itemHash[beginItemKey];
            delete connector["beginItemKey"];

            result.push(connector);
            this.updateConnections(connector);
        }
        this.updateChildren(result, key => itemHash[key]);
        return result;
    }
    importItemsData(model: DiagramModel) {
        const obj = this.getObject();
        const shapes = this.importShapes(this.getShapeObjects(obj));
        const shapeDataKeys = {};
        for(let i = 0; i < shapes.length; i++) {
            const srcShape = shapes[i];
            let destShape: Shape;
            if(srcShape.dataKey !== undefined)
                destShape = model.findShapeByDataKey(srcShape.dataKey);
            if(destShape) {
                destShape.dataKey = srcShape.dataKey;
                shapeDataKeys[srcShape.key] = srcShape.dataKey;
                destShape.locked = srcShape.locked;
                destShape.position = srcShape.position.clone();
                destShape.expanded = srcShape.expanded;
                if(srcShape.expandedSize)
                    destShape.expandedSize = srcShape.expandedSize.clone();
                destShape.size = srcShape.size.clone();
                destShape.parameters = srcShape.parameters.clone();
                destShape.style = <Style>srcShape.style.clone();
                destShape.styleText = <TextStyle>srcShape.styleText.clone();
                destShape.zIndex = srcShape.zIndex;
                destShape.text = srcShape.text;
                destShape.description = srcShape.description;
                destShape.image = srcShape.image.clone();
            }
        }
        const connectors = this.importConnectors(this.getConnectorObjects(obj));
        for(let i = 0; i < connectors.length; i++) {
            const srcConnector = connectors[i];
            let destConnector: Connector;
            if(srcConnector.dataKey !== undefined)
                destConnector = model.findConnectorByDataKey(srcConnector.dataKey);
            if(!destConnector)
                destConnector = model.findConnectorByBeginEndDataKeys(shapeDataKeys[srcConnector["beginItemKey"]],
                    shapeDataKeys[srcConnector["endItemKey"]]);
            if(destConnector) {
                destConnector.dataKey = srcConnector.dataKey;
                destConnector.locked = srcConnector.locked;
                destConnector.points = srcConnector.points.slice();
                destConnector.properties = srcConnector.properties.clone();
                destConnector.style = <Style>srcConnector.style.clone();
                destConnector.endConnectionPointIndex = srcConnector.endConnectionPointIndex;
                destConnector.beginConnectionPointIndex = srcConnector.beginConnectionPointIndex;
                destConnector.texts = srcConnector.texts.clone();
                destConnector.styleText = <TextStyle>srcConnector.styleText.clone();
                destConnector.zIndex = srcConnector.zIndex;
            }
        }
    }

    abstract getObject(): any;
    abstract getPageObject(obj: any): any;
    abstract getShapeObjects(obj: any): any[];
    abstract getConnectorObjects(obj: any): any[];

    abstract importPageSettings(model: DiagramModel, pageObj: any);
    abstract importShape(shapeObj: any): Shape;
    abstract importShapeChildren(shapeObj: any, shape: Shape): Shape[];
    abstract importConnector(connectorObj: any): Connector;

    private importShapes(shapeObjs: any[]): Shape[] {
        let result = [];
        if(!shapeObjs) return result;
        if(!Array.isArray(shapeObjs))
            throw Error("Invalid Format");
        for(let i = 0; i < shapeObjs.length; i++) {
            const shapeObj = shapeObjs[i];
            const shape = this.importShape(shapeObj);
            result.push(shape);
            result = result.concat(this.importShapeChildren(shapeObj, shape));
        }
        return result;
    }
    private importConnectors(connectorObjs: any[]): Connector[] {
        const result = [];
        if(!connectorObjs) return result;
        if(!Array.isArray(connectorObjs))
            throw Error("Invalid Format");
        for(let i = 0; i < connectorObjs.length; i++) {
            const shapeObj = connectorObjs[i];
            result.push(this.importConnector(shapeObj));
        }
        return result;
    }
    private updateChildren(items: DiagramItem[], findItem: (ItemKey) => DiagramItem) {
        items.forEach(item => {
            if(item instanceof Shape && item["childKeys"]) {
                item["childKeys"].forEach(childKey => {
                    const child = findItem(childKey);
                    if(child) {
                        if(item.children.indexOf(child) === -1)
                            item.children.push(child);
                        child.container = item;
                    }
                });
                delete item["childKeys"];
            }
        });
    }
    private updateConnections(connector: Connector) {
        if(connector.endItem)
            if(connector.endItem instanceof Shape) {
                connector.endItem.attachedConnectors.push(connector);
                connector.points[connector.points.length - 1] = connector.endItem.getConnectionPointPosition(connector.endConnectionPointIndex,
                    connector.points[connector.points.length - 2]);
            }
            else {
                connector.endItem = undefined;
                connector.endConnectionPointIndex = -1;
            }

        if(connector.beginItem)
            if(connector.beginItem instanceof Shape) {
                connector.beginItem.attachedConnectors.push(connector);
                connector.points[0] = connector.beginItem.getConnectionPointPosition(connector.beginConnectionPointIndex,
                    connector.points[1]);
            }
            else {
                connector.beginItem = undefined;
                connector.beginConnectionPointIndex = -1;
            }

    }

    protected assert(value: any, type?: string) {
        if(value === undefined)
            throw Error("Invalid Format");
        if(type !== undefined && typeof value !== type)
            throw Error("Invalid Format");
    }
}
