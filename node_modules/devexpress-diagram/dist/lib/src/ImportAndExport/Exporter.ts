import { DiagramModel } from "../Model/Model";
import { Shape } from "../Model/Shapes/Shape";
import { Connector } from "../Model/Connectors/Connector";
import { DiagramItem } from "../Model/DiagramItem";
import { ObjectUtils } from "../Utils";
import { Size } from "@devexpress/utils/lib/geometry/size";
import { CanvasExportManager } from "../Render/CanvasExportManager";

export class Exporter {
    export(model: DiagramModel): string {
        const obj = {
            page: {},
            connectors: [],
            shapes: []
        };
        obj.page = {
            "width": model.size.width,
            "height": model.size.height,
            "pageColor": model.pageColor,
            "pageWidth": model.pageSize.width,
            "pageHeight": model.pageSize.height,
            "pageLandscape": model.pageLandscape
        };
        this.exportItemsCore(model.items, obj);
        return JSON.stringify(obj);
    }
    exportItems(items: DiagramItem[]): string {
        const obj = {
            connectors: [],
            shapes: []
        };
        this.exportItemsCore(items, obj);
        return JSON.stringify(obj);
    }
    private exportItemsCore(items: DiagramItem[], obj: any): any {
        items.forEach(item => {
            if(item instanceof Shape)
                obj.shapes.push(this.exportShape(item));

            else if(item instanceof Connector) {
                const connectorObj = this.exportConnector(item);
                if(item.beginItem) {
                    connectorObj["beginItemKey"] = item.beginItem.key;
                    connectorObj["beginConnectionPointIndex"] = item.beginConnectionPointIndex;
                }
                if(item.endItem) {
                    connectorObj["endItemKey"] = item.endItem.key;
                    connectorObj["endConnectionPointIndex"] = item.endConnectionPointIndex;
                }
                obj.connectors.push(connectorObj);
            }
        });
    }
    private exportItem(item: DiagramItem) {
        return {
            "key": item.key,
            "dataKey": item.dataKey,
            "customData": ObjectUtils.cloneObject(item.customData),
            "locked": item.locked,
            "zIndex": item.zIndex
        };
    }
    private exportShape(shape: Shape) {
        const result = this.exportItem(shape);
        result["type"] = shape.description.key;
        result["text"] = shape.text;
        if(!shape.image.isEmpty)
            result["imageUrl"] = shape.image.exportUrl;
        result["x"] = shape.position.x;
        result["y"] = shape.position.y;
        result["width"] = shape.size.width;
        result["height"] = shape.size.height;

        const paramsObj = shape.parameters.toObject();
        if(paramsObj)
            result["parameters"] = paramsObj;
        const styleObj = shape.style.toObject();
        if(styleObj)
            result["style"] = styleObj;
        const styleTextObj = shape.styleText.toObject();
        if(styleTextObj)
            result["styleText"] = styleTextObj;

        if(shape.children.length)
            result["childKeys"] = shape.children.map(child => child.key);
        if(!shape.expanded)
            result["expanded"] = false;
        if(shape.expandedSize) {
            result["expandedWidth"] = shape.expandedSize.width;
            result["expandedHeight"] = shape.expandedSize.height;
        }

        return result;
    }
    private exportConnector(connector: Connector) {
        const result = this.exportItem(connector);
        result["points"] = connector.points.map(p => { return { "x": p.x, "y": p.y }; });

        const textObj = connector.texts.toObject();
        if(textObj)
            result["texts"] = textObj;
        const propsObj = connector.properties.toObject();
        if(propsObj)
            result["properties"] = propsObj;
        const styleObj = connector.style.toObject();
        if(styleObj)
            result["style"] = styleObj;
        const styleTextObj = connector.styleText.toObject();
        if(styleTextObj)
            result["styleText"] = styleTextObj;
        return result;
    }
    exportSvg(modelSize: Size, pageColor: number, exportManager: CanvasExportManager, callback: (url: string) => void) {
        exportManager.exportSvgImage(modelSize, pageColor, callback);
    }
    exportPng(modelSize: Size, pageColor: number, exportManager: CanvasExportManager, callback: (url: string) => void, useCanvgForExportToImage?: boolean) {
        exportManager.exportPngImage(modelSize, pageColor, callback, useCanvgForExportToImage);
    }
    exportJpg(modelSize: Size, pageColor: number, exportManager: CanvasExportManager, callback: (url: string) => void, useCanvgForExportToImage?: boolean) {
        exportManager.exportJpgImage(modelSize, pageColor, callback, useCanvgForExportToImage);
    }
}
