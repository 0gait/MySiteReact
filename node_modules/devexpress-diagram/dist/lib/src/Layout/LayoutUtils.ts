import { Shape } from "../Model/Shapes/Shape";
import { Margin, NodeInfo } from "./NodeLayout";

export class LayoutUtils {
    static shapeToLayout(shape: Shape): NodeInfo {
        const margin = new Margin(0);
        const shapeRect = shape.rectangle;
        shape.attachedConnectors.filter(c => !c.beginItem || !c.endItem).forEach(c => {
            const connRect = c.rectangle;
            margin.left = Math.max(margin.left, shapeRect.x - connRect.x);
            margin.right = Math.max(margin.right, connRect.right - shapeRect.right);
            margin.top = Math.max(margin.top, shapeRect.y - connRect.y);
            margin.bottom = Math.max(margin.bottom, connRect.bottom - shapeRect.bottom);
        });
        const layout = new NodeInfo(shape.key, margin, shape.size.clone());
        layout.connectionPoints = shape.description.getConnectionPoints();
        return layout;
    }
}
