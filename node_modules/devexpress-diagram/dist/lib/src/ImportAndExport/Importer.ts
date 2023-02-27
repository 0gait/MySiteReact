import { DiagramModel } from "../Model/Model";
import { Shape } from "../Model/Shapes/Shape";
import { ObjectUtils } from "../Utils";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ShapeDescriptionManager } from "../Model/Shapes/Descriptions/ShapeDescriptionManager";
import { Connector } from "../Model/Connectors/Connector";
import { ImageInfo } from "../Images/ImageInfo";
import { ImporterBase } from "./ImporterBase";
import { ImportUtils } from "./ImportUtils";
import { ColorUtils } from "@devexpress/utils/lib/utils/color";

export class Importer extends ImporterBase {
    protected obj: any;

    constructor(shapeDescriptionManager: ShapeDescriptionManager, json: string) {
        super(shapeDescriptionManager);
        this.obj = ImportUtils.parseJSON(json);
    }

    getObject(): any {
        return this.obj;
    }
    getPageObject(obj: any): any {
        return obj["page"];
    }
    getShapeObjects(obj: any): any[] {
        return obj["shapes"];
    }
    getConnectorObjects(obj: any): any[] {
        return obj["connectors"];
    }

    importPageSettings(model: DiagramModel, pageObj: any) {
        if(!pageObj) return;
        this.assert(pageObj["width"], "number");
        this.assert(pageObj["height"], "number");
        if(typeof pageObj["width"] === "number")
            model.size.width = pageObj["width"];
        if(typeof pageObj["height"] === "number")
            model.size.height = pageObj["height"];
        if(typeof pageObj["pageColor"] === "number")
            model.pageColor = pageObj["pageColor"];
        else if(typeof pageObj["pageColor"] === "string")
            model.pageColor = ColorUtils.fromString(pageObj["pageColor"]);
        if(typeof pageObj["pageWidth"] === "number")
            model.pageSize.width = pageObj["pageWidth"];
        if(typeof pageObj["pageHeight"] === "number")
            model.pageSize.height = pageObj["pageHeight"];
        if(typeof pageObj["pageLandscape"] === "boolean")
            model.pageLandscape = pageObj["pageLandscape"];
    }
    importShape(shapeObj: any): Shape {
        this.assert(shapeObj["key"], "string");
        this.assert(shapeObj["x"], "number");
        this.assert(shapeObj["y"], "number");
        this.assert(shapeObj["type"], "string");

        const shapeType = <string>shapeObj["type"];
        const description = this.shapeDescriptionManager.get(shapeType);
        const position = new Point(shapeObj["x"], shapeObj["y"]);
        const shape = new Shape(description || ShapeDescriptionManager.default, position);

        shape.key = shapeObj["key"];
        if(typeof shapeObj["dataKey"] === "string" || typeof shapeObj["dataKey"] === "number")
            shape.dataKey = shapeObj["dataKey"];
        if(typeof shapeObj["customData"] === "object")
            shape.customData = ObjectUtils.cloneObject(shapeObj["customData"]);
        if(typeof shapeObj["locked"] === "boolean")
            shape.locked = shapeObj["locked"];
        if(typeof shapeObj["width"] === "number")
            shape.size.width = shapeObj["width"];
        if(typeof shapeObj["height"] === "number")
            shape.size.height = shapeObj["height"];
        if(typeof shapeObj["text"] === "string")
            shape.text = shapeObj["text"];
        if(typeof shapeObj["imageUrl"] === "string")
            shape.image = new ImageInfo(shapeObj["imageUrl"]);
        if(shapeObj["parameters"]) {
            shape.parameters.fromObject(shapeObj["parameters"]);
            shape.description.normalizeParameters(shape, shape.parameters);
        }
        if(shapeObj["style"])
            shape.style.fromObject(shapeObj["style"]);
        if(shapeObj["styleText"])
            shape.styleText.fromObject(shapeObj["styleText"]);
        if(typeof shapeObj["zIndex"] === "number")
            shape.zIndex = shapeObj["zIndex"];

        if(Array.isArray(shapeObj["childKeys"]))
            shape["childKeys"] = shapeObj["childKeys"].slice();
        if(typeof shapeObj["expanded"] === "boolean")
            shape.expanded = shapeObj["expanded"];
        if(typeof shapeObj["expandedWidth"] === "number" && typeof shapeObj["expandedHeight"] === "number")
            shape.expandedSize = new Size(shapeObj["expandedWidth"], shapeObj["expandedHeight"]);

        return shape;
    }
    importShapeChildren(shapeObj: any, shape: Shape): Shape[] {
        return [];
    }
    importConnector(connectorObj: any): Connector {
        this.assert(connectorObj["key"], "string");
        if(!Array.isArray(connectorObj["points"]))
            throw Error("Invalid Format");
        const points = (<Array<any>>connectorObj["points"]).map(pt => {
            this.assert(pt["x"], "number");
            this.assert(pt["y"], "number");
            return new Point(pt["x"], pt["y"]);
        });
        const connector = new Connector(points);
        connector.key = connectorObj["key"];
        if(typeof connectorObj["dataKey"] === "string" || typeof connectorObj["dataKey"] === "number")
            connector.dataKey = connectorObj["dataKey"];
        if(typeof connectorObj["customData"] === "object")
            connector.customData = ObjectUtils.cloneObject(connectorObj["customData"]);
        if(typeof connectorObj["locked"] === "boolean")
            connector.locked = connectorObj["locked"];
        connector.endConnectionPointIndex = typeof connectorObj["endConnectionPointIndex"] === "number" ? connectorObj["endConnectionPointIndex"] : -1;
        connector.beginConnectionPointIndex = typeof connectorObj["beginConnectionPointIndex"] === "number" ? connectorObj["beginConnectionPointIndex"] : -1;
        if(connectorObj["endItemKey"] !== undefined)
            this.assert(connectorObj["endItemKey"], "string");
        if(connectorObj["beginItemKey"] !== undefined)
            this.assert(connectorObj["beginItemKey"], "string");
        connector["endItemKey"] = connectorObj["endItemKey"];
        connector["beginItemKey"] = connectorObj["beginItemKey"];
        if(connectorObj["texts"])
            connector.texts.fromObject(connectorObj["texts"]);
        if(connectorObj["properties"])
            connector.properties.fromObject(connectorObj["properties"]);
        if(connectorObj["style"])
            connector.style.fromObject(connectorObj["style"]);
        if(connectorObj["styleText"])
            connector.styleText.fromObject(connectorObj["styleText"]);
        if(typeof connectorObj["zIndex"] === "number")
            connector.zIndex = connectorObj["zIndex"];
        return connector;
    }
}
