import { ConnectorPointsCalculatorBase } from "./ConnectorPointsCalculatorBase";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";

export class ConnectorPointsCalculator extends ConnectorPointsCalculatorBase {
    getPoints(): ConnectorRenderPoint[] {
        return this.connector.points.map((pt, index) => new ConnectorRenderPoint(pt.x, pt.y, index));
    }
}
