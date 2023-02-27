import { Connector } from "../Connector";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";

export abstract class ConnectorPointsCalculatorBase {
    constructor(public connector: Connector) {}

    abstract getPoints(): ConnectorRenderPoint[];
}
