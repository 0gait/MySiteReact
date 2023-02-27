import { DiagramControl } from "../Diagram";
import { DiagramItem } from "../Model/DiagramItem";
import { ChangeShapeTextHistoryItem } from "../History/Properties/ChangeShapeTextHistoryItem";
import { DiagramMouseEvent, MouseEventElementType, DiagramKeyboardEvent, DiagramEvent, DiagramFocusEvent } from "./Event";
import { ModifierKey } from "@devexpress/utils/lib/utils/key";
import { Shape } from "../Model/Shapes/Shape";
import { Connector } from "../Model/Connectors/Connector";
import { ChangeConnectorTextHistoryItem } from "../History/Properties/ChangeConnectorTextHistoryItem";

export class TextInputHandler {
    control: DiagramControl;
    textInputItem: DiagramItem;
    textInputPosition: number;

    constructor(control: DiagramControl) {
        this.control = control;
    }
    startTextInput(item: DiagramItem, position?: number): void {
        if(item.isLocked || !item.enableText || !item.allowEditText || this.control.settings.readOnly || !this.canFinishTextEditing()) return;

        this.control.beginUpdate();
        this.textInputItem = item;
        let allowed = true;
        if(this.textInputItem instanceof Shape) {
            const textRect = this.textInputItem.textEditRectangle;
            allowed = this.control.permissionsProvider.canChangeShapeText(this.textInputItem);
            if(allowed)
                this.control.eventManager.raiseTextInputStart(this.textInputItem, this.textInputItem.text, textRect.createPosition(), textRect.createSize());
        }
        else if(this.textInputItem instanceof Connector) {
            this.textInputPosition = position;
            allowed = this.control.permissionsProvider.canChangeConnectorText(this.textInputItem, this.textInputPosition);
            if(allowed)
                this.control.eventManager.raiseTextInputStart(this.textInputItem, this.textInputItem.getText(this.textInputPosition), this.textInputItem.getTextPoint(this.textInputPosition));
        }
        if(!allowed) {
            delete this.textInputItem;
            this.control.endUpdate();
        }
    }
    endTextInput(captureFocus?: boolean) {
        const textInputItem = this.textInputItem;
        delete this.textInputItem;
        this.control.eventManager.raiseTextInputEnd(textInputItem, captureFocus);
        this.control.endUpdate();
        this.control.barManager.updateItemsState();
    }
    raiseTextInputPermissionsCheck(allowed: boolean): void {
        this.control.eventManager.raiseTextInputPermissionsCheck(this.textInputItem, allowed);
    }
    applyTextInput(text: string, captureFocus?: boolean): void {
        if(!this.canFinishTextEditing(text)) return;
        const textInputItem = this.textInputItem;
        const textInputPosition = this.textInputPosition;

        this.endTextInput(captureFocus);

        if(textInputItem instanceof Shape) {
            if(textInputItem.text !== text)
                this.control.history.addAndRedo(
                    new ChangeShapeTextHistoryItem(textInputItem, text)
                );
        }
        else if(textInputItem instanceof Connector)
            if(textInputItem.getText(textInputPosition) !== text)
                this.control.history.addAndRedo(
                    new ChangeConnectorTextHistoryItem(textInputItem, textInputPosition, text)
                );

    }
    canFinishTextEditing(text?: string): boolean {
        let allowed = true;
        if(this.isTextInputActive()) {
            const newText = text || this.getTextInputElementValue();
            if(this.textInputItem instanceof Shape)
                allowed = this.control.permissionsProvider.canApplyShapeTextChange(this.textInputItem as Shape, newText);
            else if(this.textInputItem instanceof Connector)
                allowed = this.control.permissionsProvider.canApplyConnectorTextChange(this.textInputItem as Connector, this.textInputPosition, newText);
            this.raiseTextInputPermissionsCheck(allowed);
        }
        return allowed;
    }
    private getTextInputElementValue() {
        if(this.control.render)
            return this.control.render.input.getTextInputElementValue();
        return "";
    }
    cancelTextInput(): void {
        this.raiseTextInputPermissionsCheck(true);
        this.endTextInput(true);
    }
    isTextInputActive(): boolean {
        return this.textInputItem !== undefined;
    }
    processDblClick(evt: DiagramMouseEvent): void {
        if(evt.source.type === MouseEventElementType.Shape) {
            const shape = this.control.model.findShape(evt.source.key);
            this.startTextInput(shape);
        }
        else if(evt.source.type === MouseEventElementType.Connector) {
            const connector = this.control.model.findConnector(evt.source.key);
            const position = connector.getTextPositionByPoint(evt.modelPoint);
            this.startTextInput(connector, position);
        }
        else if(evt.source.type === MouseEventElementType.ConnectorText) {
            const connector = this.control.model.findConnector(evt.source.key);
            const position = parseFloat(evt.source.value);
            this.startTextInput(connector, position);
        }
    }
    onDblClick(evt: DiagramMouseEvent) {
        setTimeout(() => {
            this.processDblClick(evt);
        }, 10);
    }
    onKeyDown(evt: DiagramKeyboardEvent) {
        if(!this.isTextInputActive()) return;
        if(evt.keyCode === 13 && this.hasCtrlModifier(evt.modifiers)) {
            evt.preventDefault = true;
            this.applyTextInput(evt.inputText, true);
        }
        if(evt.keyCode === 27)
            this.cancelTextInput();
    }
    onBlur(evt: DiagramFocusEvent) {
        if(this.isTextInputActive())
            this.applyTextInput(evt.inputText);
    }
    onFocus(evt: DiagramEvent) {
    }

    private hasCtrlModifier(key: ModifierKey): boolean {
        return (key & ModifierKey.Ctrl) > 0;
    }
}
