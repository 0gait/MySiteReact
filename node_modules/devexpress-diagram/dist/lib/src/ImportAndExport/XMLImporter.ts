import { DiagramModel } from "../Model/Model";
import { Connector } from "../Model/Connectors/Connector";
import { Shape } from "../Model/Shapes/Shape";
import { ImporterBase } from "./ImporterBase";
import { ShapeTypes } from "../Model/Shapes/ShapeTypes";
import { ShapeDescriptionManager } from "../Model/Shapes/Descriptions/ShapeDescriptionManager";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { Point } from "@devexpress/utils/lib/geometry/point";
import { ImportUtils } from "./ImportUtils";
import { DiagramItem } from "../Model/DiagramItem";
import { ColorUtils } from "@devexpress/utils/lib/utils/color";
import { UnitConverter } from "@devexpress/utils/lib/class/unit-converter";

export class XmlImporter extends ImporterBase {
    protected doc: Document;
    protected static readonly shapeTypes: {[key: string]: string} = {
        "BasicShapes.Rectangle": ShapeTypes.Rectangle,
        "BasicShapes.Ellipse": ShapeTypes.Ellipse,
        "BasicShapes.Triangle": ShapeTypes.Triangle,
        "BasicShapes.Pentagon": ShapeTypes.Pentagon,
        "BasicShapes.Hexagon": ShapeTypes.Hexagon,
        "BasicShapes.Octagon": ShapeTypes.Octagon,
        "BasicShapes.Diamond": ShapeTypes.Diamond,
        "BasicShapes.Cross": ShapeTypes.Cross,
        "BasicShapes.Star5": ShapeTypes.Star,

        "BasicFlowchartShapes.StartEnd": ShapeTypes.Terminator,
        "BasicFlowchartShapes.Data": ShapeTypes.Data,
        "BasicFlowchartShapes.Database": ShapeTypes.Database,
        "BasicFlowchartShapes.ExternalData": ShapeTypes.StoredData,
        "BasicFlowchartShapes.Process": ShapeTypes.Process,
        "BasicFlowchartShapes.Decision": ShapeTypes.Decision,
        "BasicFlowchartShapes.Subprocess": ShapeTypes.PredefinedProcess,
        "BasicFlowchartShapes.Document": ShapeTypes.Document,
        "BasicFlowchartShapes.Custom1": ShapeTypes.ManualInput,
        "BasicFlowchartShapes.Custom2": ShapeTypes.ManualOperation,

        "ArrowShapes.SimpleArrow": ShapeTypes.ArrowLeft,
        "ArrowShapes.SimpleDoubleArrow": ShapeTypes.ArrowLeftRight
    };

    constructor(shapeDescriptionManager: ShapeDescriptionManager, xml: string) {
        super(shapeDescriptionManager);
        this.doc = ImportUtils.createDocument(xml);
    }

    getObject(): any {
        return this.doc;
    }
    getPageObject(obj: any): any {
        const pageElements = this.doc.querySelectorAll("[ItemKind='DiagramRoot']");
        return pageElements && pageElements[0];
    }
    getShapeObjects(obj: any): any[] {
        const shapeObjs = [];
        this.doc.querySelectorAll("[ItemKind='DiagramRoot'] > Children > [ItemKind='DiagramShape']").forEach(obj => { shapeObjs.push(obj); });
        this.doc.querySelectorAll("[ItemKind='DiagramRoot'] > Children > [ItemKind='DiagramContainer']").forEach(obj => { shapeObjs.push(obj); });
        return shapeObjs;
    }
    getConnectorObjects(obj: any): any[] {
        const connectorObjs = [];
        this.doc.querySelectorAll("[ItemKind='DiagramRoot'] > Children > [ItemKind='DiagramConnector']").forEach(obj => { connectorObjs.push(obj); });
        return connectorObjs;
    }

    importPageSettings(model: DiagramModel, pageObj: Element) {
        if(!pageObj) return;
        const pageSizeAttr = pageObj.getAttribute("PageSize");
        const pageSize = this.getSize(pageSizeAttr);
        if(pageSize) {
            model.size = pageSize.clone();
            model.pageSize = pageSize.clone();
        }
    }
    importShape(shapeObj: Element): Shape {
        const positionAttr = shapeObj.getAttribute("Position");
        const position = this.getPoint(positionAttr);

        const shapeAttr = shapeObj.getAttribute("Shape");
        const shapeType = this.getShapeType(shapeAttr);
        const description = this.shapeDescriptionManager.get(shapeType);
        const shape = new Shape(description || ShapeDescriptionManager.default, position);
        shape.key = this.getItemKey(shapeObj);

        const sizeAttr = shapeObj.getAttribute("Size");
        const size = this.getSize(sizeAttr);
        if(size) shape.size = size;

        const contentAttr = shapeObj.getAttribute("Content");
        if(typeof contentAttr === "string")
            shape.text = contentAttr;
        else {
            const headerAttr = shapeObj.getAttribute("Header");
            if(typeof headerAttr === "string")
                shape.text = headerAttr;
        }

        this.importStyle(shapeObj, shape);

        return shape;
    }
    importShapeChildren(shapeObj: Element, shape: Shape): Shape[] {
        const childShapeObjs = [];
        shapeObj.setAttribute("dxDiagram", "");
        this.doc.querySelectorAll("[dxDiagram] > Children > [ItemKind='DiagramShape']").forEach(obj => { childShapeObjs.push(obj); });
        this.doc.querySelectorAll("[dxDiagram] > Children > [ItemKind='DiagramContainer']").forEach(obj => { childShapeObjs.push(obj); });
        shapeObj.removeAttribute("dxDiagram");

        let result = [];
        if(!childShapeObjs) return result;

        for(let i = 0; i < childShapeObjs.length; i++) {
            const childShapeObj = childShapeObjs[i];
            const childShape = this.importShape(childShapeObj);
            childShape.key = shape.key + "," + childShape.key;
            const rect = shape.clientRectangle;
            childShape.position = childShape.position.clone().offset(rect.x, rect.y);
            if(!shape["childKeys"])
                shape["childKeys"] = [];
            shape["childKeys"].push(childShape.key);
            result.push(childShape);
            result = result.concat(this.importShapeChildren(childShapeObj, childShape));
        }
        return result;
    }
    importConnector(connectorObj: Element): Connector {
        const points = [];
        const beginPointAttr = connectorObj.getAttribute("BeginPoint");
        const beginPoint = this.getPoint(beginPointAttr);
        if(beginPoint) points.push(beginPoint);
        const pointsAttr = connectorObj.getAttribute("Points");
        pointsAttr.split(" ").forEach(pointAttr => {
            const point = this.getPoint(pointAttr);
            if(point) points.push(point);
        });
        const endPointAttr = connectorObj.getAttribute("EndPoint");
        const endPoint = this.getPoint(endPointAttr);
        if(endPoint) points.push(endPoint);

        const connector = new Connector(points);
        connector.key = this.getItemKey(connectorObj);

        const endItemPointIndexAttr = connectorObj.getAttribute("EndItemPointIndex");
        const endItemPointIndex = parseInt(endItemPointIndexAttr);
        connector.endConnectionPointIndex = !isNaN(endItemPointIndex) ? endItemPointIndex : -1;
        const beginItemPointIndexAttr = connectorObj.getAttribute("BeginItemPointIndex");
        const beginItemPointIndex = parseInt(beginItemPointIndexAttr);
        connector.beginConnectionPointIndex = !isNaN(beginItemPointIndex) ? beginItemPointIndex : -1;
        const endItemAttr = connectorObj.getAttribute("EndItem");
        if(endItemAttr !== undefined)
            this.assert(endItemAttr, "string");
        const beginItemAttr = connectorObj.getAttribute("BeginItem");
        if(beginItemAttr !== undefined)
            this.assert(beginItemAttr, "string");
        connector["endItemKey"] = endItemAttr;
        connector["beginItemKey"] = beginItemAttr;

        const contentAttr = connectorObj.getAttribute("Content");
        if(typeof contentAttr === "string")
            connector.setText(contentAttr);

        this.importStyle(connectorObj, connector);

        return connector;
    }
    importStyle(obj: Element, item: DiagramItem) {
        const backgroundAttr = obj.getAttribute("Background");
        if(typeof backgroundAttr === "string")
            item.style["fill"] = this.getColor(backgroundAttr);
        const strokeAttr = obj.getAttribute("Stroke");
        if(typeof strokeAttr === "string")
            item.style["stroke"] = this.getColor(strokeAttr);

        const foregroundAttr = obj.getAttribute("Foreground");
        if(typeof foregroundAttr === "string")
            item.styleText["fill"] = this.getColor(foregroundAttr);
        const fontFamilyAttr = obj.getAttribute("FontFamily");
        if(typeof fontFamilyAttr === "string")
            item.styleText["font-family"] = fontFamilyAttr;
        const fontSizeAttr = obj.getAttribute("FontSize");
        if(typeof fontSizeAttr === "string")
            item.styleText["font-size"] = fontSizeAttr;
        const fontWeightAttr = obj.getAttribute("FontWeight");
        if(fontWeightAttr === "Bold")
            item.styleText["font-weight"] = "bold";
        const fontStyleAttr = obj.getAttribute("FontStyle");
        if(fontStyleAttr === "Italic")
            item.styleText["font-style"] = "italic";
        const textDecorationsAttr = obj.getAttribute("TextDecorations");
        if(textDecorationsAttr === "Underline")
            item.styleText["text-decoration"] = "underline";
        const textAlignmentAttr = obj.getAttribute("TextAlignment");
        if(textAlignmentAttr === "Left")
            item.styleText["text-anchor"] = "start";
        else if(textAlignmentAttr === "Right")
            item.styleText["text-anchor"] = "end";
        else if(textAlignmentAttr === "Center")
            item.styleText["text-anchor"] = "middle";
    }
    private getShapeType(shapeAttr: string) {
        if(XmlImporter.shapeTypes[shapeAttr])
            return XmlImporter.shapeTypes[shapeAttr];
        if(shapeAttr && shapeAttr.toLowerCase().indexOf("container") > -1)
            return ShapeTypes.VerticalContainer;
        return ShapeTypes.Rectangle;
    }
    private getItemKey(obj: Element) {
        return (parseInt(obj.tagName.replace("Item", "")) - 1).toString();
    }
    private getNumbers(s: string): number[] {
        const parts = s.split(",");
        return parts && parts.length ? parts.map(part => +part) : [];
    }
    private getSize(attrValue: string): Size {
        if(attrValue) {
            const numbers = this.getNumbers(attrValue);
            if(numbers.length >= 2) {
                this.assert(numbers[0], "number");
                this.assert(numbers[1], "number");
                return new Size(UnitConverter.pixelsToTwips(numbers[0]), UnitConverter.pixelsToTwips(numbers[1]));
            }
        }
    }
    private getPoint(attrValue: string): Point {
        if(attrValue) {
            const numbers = this.getNumbers(attrValue);
            if(numbers.length >= 2) {
                this.assert(numbers[0], "number");
                this.assert(numbers[1], "number");
                return new Point(UnitConverter.pixelsToTwips(numbers[0]), UnitConverter.pixelsToTwips(numbers[1]));
            }
        }
    }
    private getColor(attrValue: string): string {
        attrValue = attrValue.charAt(0) === "#" ? attrValue.substr(1) : attrValue;
        const color = parseInt(attrValue, 16);
        return !isNaN(color) ? ColorUtils.colorToHash(color) : undefined;
    }
}
