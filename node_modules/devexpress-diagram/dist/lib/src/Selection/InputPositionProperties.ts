import { Selection } from "./Selection";
import { ConnectorProperties } from "../Model/Connectors/ConnectorProperties";
import { Style, TextStyle, StyleBase } from "../Model/Style";

export class InputPositionProperties {
    private connectorProperties: ConnectorProperties;
    private style: Style;
    private textStyle: TextStyle;

    constructor(private selection: Selection, private baseProperties?: InputPositionProperties, private disableMergingStyles?: boolean) {
        this.selection = selection;
    }

    reset() {
        this.connectorProperties = null;
        this.style = null;
        this.textStyle = null;
    }

    getConnectorProperties(): ConnectorProperties {
        if(!this.connectorProperties) {
            this.connectorProperties = this.baseProperties ? this.baseProperties.getConnectorProperties().clone() : new ConnectorProperties();
            this.updateConnectorProperties(this.connectorProperties);
        }
        return this.connectorProperties;
    }
    getConnectorPropertyValue(propertyName: string): any {
        return this.getConnectorProperties()[propertyName];
    }
    setConnectorPropertyValue(propertyName: string, value: any) {
        this.getConnectorProperties()[propertyName] = value;
    }

    getStyle(): Style {
        if(!this.style) {
            this.style = this.baseProperties ? <Style> this.baseProperties.getStyle().clone() : new Style();
            if(!this.disableMergingStyles)
                this.updateStyle(this.style, "style");
        }
        return this.style;
    }
    getStylePropertyValue(propertyName: string): any {
        return this.getStyle()[propertyName];
    }
    setStylePropertyValue(propertyName: string, value: any) {
        this.getStyle()[propertyName] = value;
    }

    getTextStyle(): TextStyle {
        if(!this.textStyle) {
            this.textStyle = this.baseProperties ? <TextStyle> this.baseProperties.getTextStyle().clone() : new TextStyle();
            if(!this.disableMergingStyles)
                this.updateStyle(this.textStyle, "styleText");
        }
        return this.textStyle;
    }
    getTextStylePropertyValue(propertyName: string): any {
        return this.getTextStyle()[propertyName];
    }
    setTextStylePropertyValue(propertyName: string, value: any) {
        this.getTextStyle()[propertyName] = value;
    }

    private updateConnectorProperties(properties: ConnectorProperties) {
        const connectors = this.selection.getSelectedConnectors(true);
        properties.forEach(propertyName => {
            this.updatePropertyValue(properties, connectors, item => item["properties"], propertyName);
        });
    }
    private updateStyle(style: StyleBase, stylePropertyName: string) {
        const items = this.selection.getSelectedItems(true);
        style.forEach(propertyName => {
            this.updatePropertyValue(style, items, item => item[stylePropertyName], propertyName);
        });
    }
    private updatePropertyValue(destObj: any, items: any[], getSrcObj: (item) => any, propertyName: string) {
        let value;
        let valueAssigned = false;
        items.forEach(item => {
            const obj = getSrcObj(item);
            const propertyValue = obj[propertyName];
            if(value === undefined && propertyValue !== undefined) {
                value = propertyValue;
                valueAssigned = true;
            }
            else if(valueAssigned && value !== propertyValue) {
                value = undefined;
                return;
            }
        });
        if(valueAssigned)
            destObj[propertyName] = value;
    }
}
