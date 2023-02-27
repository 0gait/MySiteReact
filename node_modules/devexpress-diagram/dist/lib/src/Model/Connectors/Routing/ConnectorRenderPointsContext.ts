import { ConnectorRoutingMode } from "../../../Settings";
import { ConnectorRenderPoint } from "../ConnectorRenderPoint";

export class ConnectorRenderPointsContext {
    constructor(
        readonly renderPoints: ConnectorRenderPoint[],
        readonly lockCreateRenderPoints: boolean,
        readonly actualRoutingMode: ConnectorRoutingMode) {
    }
}
