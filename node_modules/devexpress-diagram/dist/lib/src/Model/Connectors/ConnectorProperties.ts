export enum ConnectorLineOption { Straight, Orthogonal }
export enum ConnectorLineEnding { None = 0, Arrow = 1, OutlinedTriangle = 2, FilledTriangle = 3 }

export const DEFAULT_CONNECTOR_LINEOPTION = ConnectorLineOption.Orthogonal;
export const DEFAULT_CONNECTOR_STARTLINEENDING = ConnectorLineEnding.None;
export const DEFAULT_CONNECTOR_ENDLINEENDING = ConnectorLineEnding.Arrow;

export class ConnectorProperties {
    lineOption: ConnectorLineOption = DEFAULT_CONNECTOR_LINEOPTION;
    startLineEnding: ConnectorLineEnding = DEFAULT_CONNECTOR_STARTLINEENDING;
    endLineEnding: ConnectorLineEnding = DEFAULT_CONNECTOR_ENDLINEENDING;

    clone() {
        const clone = new ConnectorProperties();
        clone.lineOption = this.lineOption;
        clone.startLineEnding = this.startLineEnding;
        clone.endLineEnding = this.endLineEnding;
        return clone;
    }
    forEach(callback: (propertyName) => void) {
        for(const propertyName in this)
            if(Object.prototype.hasOwnProperty.call(this, propertyName))
                callback(propertyName);
    }
    toObject() {
        const result = {};
        let modified = false;
        if(this.lineOption !== DEFAULT_CONNECTOR_LINEOPTION) {
            result["lineOption"] = this.lineOption;
            modified = true;
        }
        if(this.startLineEnding !== DEFAULT_CONNECTOR_STARTLINEENDING) {
            result["startLineEnding"] = this.startLineEnding;
            modified = true;
        }
        if(this.endLineEnding !== DEFAULT_CONNECTOR_ENDLINEENDING) {
            result["endLineEnding"] = this.endLineEnding;
            modified = true;
        }
        return modified ? result : null;
    }
    fromObject(obj: any) {
        if(typeof obj["lineOption"] === "number")
            this.lineOption = obj["lineOption"];
        if(typeof obj["startLineEnding"] === "number")
            this.startLineEnding = obj["startLineEnding"];
        if(typeof obj["endLineEnding"] === "number")
            this.endLineEnding = obj["endLineEnding"];
    }
}
