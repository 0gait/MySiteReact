import { Selection, ISelectionChangesListener } from "./Selection";
import { InputPositionProperties } from "./InputPositionProperties";
import { Style, TextStyle } from "../Model/Style";
import { Data } from "../Utils/Data";

export class InputPosition implements ISelectionChangesListener {
    private selection: Selection;

    private initialProperties: InputPositionProperties;
    private defaultProperties: InputPositionProperties;
    private currentProperties: InputPositionProperties;

    constructor(selection: Selection) {
        this.selection = selection;
        this.initialProperties = new InputPositionProperties(this.selection);
        this.defaultProperties = new InputPositionProperties(this.selection, this.initialProperties, true);
        this.currentProperties = new InputPositionProperties(this.selection, this.defaultProperties);
    }

    initialize() {
        this.reset();
        this.defaultProperties.reset();
    }
    reset() {
        this.currentProperties.reset();
    }

    getDefaultConnectorProperties() {
        return this.defaultProperties.getConnectorProperties();
    }
    getDefaultConnectorPropertyValue(propertyName: string): any {
        return this.defaultProperties.getConnectorPropertyValue(propertyName);
    }

    getCurrentConnectorPropertyValue(propertyName: string): any {
        return this.currentProperties.getConnectorPropertyValue(propertyName);
    }

    setConnectorPropertyValue(propertyName: string, value: any) {
        this.currentProperties.setConnectorPropertyValue(propertyName, value);
        if(this.selection.isEmpty(true))
            this.defaultProperties.setConnectorPropertyValue(propertyName, value);
    }
    setInitialConnectorProperties(properties: any) {
        this.defaultProperties.reset();
        this.currentProperties.reset();

        for(const propertyName in properties)
            if(Object.prototype.hasOwnProperty.call(properties, propertyName))
                this.initialProperties.setConnectorPropertyValue(propertyName, properties[propertyName]);

    }
    getDefaultStyle(): Style {
        return this.defaultProperties.getStyle();
    }
    getDefaultStylePropertyValue(propertyName: string): any {
        return this.defaultProperties.getStylePropertyValue(propertyName);
    }
    getDefaultTextStyle(): TextStyle {
        return this.defaultProperties.getTextStyle();
    }
    getDefaultTextStylePropertyValue(propertyName: string): any {
        return this.defaultProperties.getTextStylePropertyValue(propertyName);
    }

    getCurrentStylePropertyValue(propertyName: string): any {
        return this.currentProperties.getStylePropertyValue(propertyName);
    }
    getCurrentTextStylePropertyValue(propertyName: string): any {
        return this.currentProperties.getTextStylePropertyValue(propertyName);
    }

    setStylePropertyValue(propertyName: string, value: any) {
        this.currentProperties.setStylePropertyValue(propertyName, value);
        if(this.selection.isEmpty(true))
            this.defaultProperties.setStylePropertyValue(propertyName, value);
    }
    setTextStylePropertyValue(propertyName: string, value: any) {
        this.currentProperties.setTextStylePropertyValue(propertyName, value);
        if(this.selection.isEmpty(true))
            this.defaultProperties.setTextStylePropertyValue(propertyName, value);
    }
    setInitialStyleProperties(style: any) {
        this.defaultProperties.reset();
        this.currentProperties.reset();

        const styleObj = typeof style === "string" ? Data.cssTextToObject(style) : style;
        for(const propertyName in styleObj)
            if(Object.prototype.hasOwnProperty.call(styleObj, propertyName))
                this.initialProperties.setStylePropertyValue(propertyName, styleObj[propertyName]);

    }
    setInitialTextStyleProperties(style: any) {
        this.defaultProperties.reset();
        this.currentProperties.reset();

        const styleObj = typeof style === "string" ? Data.cssTextToObject(style) : style;
        for(const propertyName in styleObj)
            if(Object.prototype.hasOwnProperty.call(styleObj, propertyName))
                this.initialProperties.setTextStylePropertyValue(propertyName, styleObj[propertyName]);

    }

    notifySelectionChanged(selection: Selection) {
        this.reset();
    }
}
