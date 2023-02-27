import { DiagramControl } from "../Diagram";
import { ICommand } from "./ICommand";
import { DeleteCommand } from "./Common/DeleteCommand";
import { UndoCommand } from "./Common/UndoCommand";
import { RedoCommand } from "./Common/RedoCommand";
import { ImportCommand } from "./ImportAndExport/ImportCommand";
import { ExportCommand } from "./ImportAndExport/ExportCommand";
import { ToggleFontBoldCommand } from "./StyleProperties/ToggleFontBoldCommand";
import { ToggleFontItalicCommand } from "./StyleProperties/ToggleFontItalicCommand";
import { ToggleFontUnderlineCommand } from "./StyleProperties/ToggleFontUnderlineCommand";
import { ChangeFontNameCommand } from "./StyleProperties/ChangeFontNameCommand";
import { ChangeFontSizeCommand } from "./StyleProperties/ChangeFontSizeCommand";
import { ChangeFontColorCommand } from "./StyleProperties/ChangeFontColorCommand";
import { ChangeFillColorCommand } from "./StyleProperties/ChangeFillColorCommand";
import { ChangeStrokeColorCommand } from "./StyleProperties/ChangeStrokeColorCommand";
import { TextLeftAlignCommand, TextCenterAlignCommand, TextRightAlignCommand } from "./StyleProperties/ChangeTextAlignCommand";
import { ChangeConnectorEndLineEndingCommand, ChangeConnectorStartLineEndingCommand } from "./Properties/ChangeConnectorLineEndingCommand";
import { ChangeConnectorLineOptionCommand } from "./Properties/ChangeConnectorLineOptionCommand";
import { SelectAllCommand } from "./Common/SelectAllCommand";
import { ModifierKey, KeyCode } from "@devexpress/utils/lib/utils/key";
import { AutoLayoutTreeVerticalCommand } from "./AutoLayout/AutoLayoutTreeVerticalCommand";
import { ChangeSnapToGridCommand } from "./Page/ChangeSnapToGridCommand";
import { ChangeGridSizeCommand, ChangeGridSizeItemsCommand } from "./Page/ChangeGridSizeCommand";
import { ChangePageLandscapeCommand } from "./Page/ChangePageLandscapeCommand";
import { ChangePageSizeCommand, ChangePageSizeItemsCommand } from "./Page/ChangePageSizeCommand";
import { ExportPngCommand } from "./ImportAndExport/ExportPngCommand";
import { ExportSvgCommand } from "./ImportAndExport/ExportSvgCommand";
import { ExportJpgCommand } from "./ImportAndExport/ExportJpgCommand";
import { CopySelectionCommand } from "./Clipboard/CopySelectionCommand";
import { CutSelectionCommand } from "./Clipboard/CutSelectionCommand";
import { PasteSelectionCommand } from "./Clipboard/PasteSelectionCommand";
import { ImportBPMNCommand } from "./ImportAndExport/ImportBPMNCommand";
import { SendToBackCommand } from "./Properties/SendToBackCommand";
import { BringToFrontCommand } from "./Properties/BringToFrontCommand";
import { AutoLayoutLayeredHorizontalCommand } from "./AutoLayout/AutoLayoutLayeredHorizontalCommand";
import { MoveDownCommand, MoveUpCommand, MoveRightCommand, MoveLeftCommand, MoveStepLeftCommand, MoveStepRightCommand, MoveStepUpCommand, MoveStepDownCommand } from "./Keyboard/MoveCommands";
import { ChangeZoomLevelCommand, FitToScreenCommand, SwitchAutoZoomCommand, FitToWidthCommand, ChangeZoomLevelItemsCommand, ChangeZoomLevelTo25Command, ChangeZoomLevelTo75Command, ChangeZoomLevelTo100Command, ChangeZoomLevelTo125Command, ChangeZoomLevelTo50Command, ChangeZoomLevelTo150Command, ChangeZoomLevelTo200Command, ToggleAutoZoomToContentCommand, ToggleAutoZoomToWidthCommand, ToggleAutoZoomCommand, ChangeZoomLevelInPercentageCommand } from "./Page/ChangeZoomLevelCommand";
import { BindDocumentCommand } from "./DataBinding/BindDocumentCommand";
import { UnbindDocumentCommand } from "./DataBinding/UnbindDocumentCommand";
import { AutoLayoutTreeHorizontalCommand } from "./AutoLayout/AutoLayoutTreeHorizontalCommand";
import { AutoLayoutLayeredVerticalCommand } from "./AutoLayout/AutoLayoutLayeredVerticalCommand";
import { LockCommand } from "./Properties/LockCommand";
import { UnLockCommand } from "./Properties/UnlockCommand";
import { CloneLeftCommand, CloneRightCommand, CloneUpCommand, CloneDownCommand } from "./Keyboard/CloneCommand";
import { ChangeUnitsCommand, ChangeViewUnitsCommand } from "./Page/ChangeUnitsCommand";
import { ChangePageColorCommand } from "./Page/ChangePageColorCommand";
import { ChangeShowGridCommand } from "./Page/ChangeShowGridCommand";
import { ToggleFullscreenCommand } from "./Page/ToggleFullscreenCommand";
import { ToggleSimpleViewCommand } from "./Page/ToggleSimpleViewCommand";
import { ToggleReadOnlyCommand } from "./Page/ToggleReadOnlyCommand";
import { EditShapeImageCommand } from "./ShapeImages/EditShapeImageCommand";
import { PasteSelectionInPositionCommand } from "./Clipboard/PasteSelectionInPosition";
import { ImportXMLCommand } from "./ImportAndExport/ImportXMLCommand";
import { InsertShapeImageCommand } from "./ShapeImages/InsertShapeImageCommand";
import { DeleteShapeImageCommand } from "./ShapeImages/DeleteShapeImageCommand";
import { ChangeStrokeStyleCommand } from "./StyleProperties/ChangeStrokeStyleCommand";
import { ChangeStrokeWidthCommand } from "./StyleProperties/ChangeStrokeWidthCommand";
import { AutoLayoutTreeVerticalBottomToTopCommand } from "./AutoLayout/AutoLayoutTreeVerticalBottomToTopCommand";
import { AutoLayoutTreeHorizontalRightToLeftCommand } from "./AutoLayout/AutoLayoutTreeHorizontalRightToLeftCommand";
import { AutoLayoutLayeredVerticalBottomToTopCommand } from "./AutoLayout/AutoLayoutLayeredVerticalBottomToTopCommand";
import { AutoLayoutLayeredHorizontalRightToLeftCommand } from "./AutoLayout/AutoLayoutLayeredHorizontalRightToLeftCommand";
import { ChangeConnectorRoutingModeCommand } from "./Properties/ChangeConnectorRoutingModeCommand";

export enum DiagramCommand {
    Undo = 0,
    Redo = 1,

    Cut = 2,
    Copy = 3,
    Paste = 4,
    PasteInPosition = 5,
    SelectAll = 6,
    Delete = 7,

    Import = 8,
    ImportBPMN = 9,
    Export = 10,
    ExportSvg = 11,
    ExportPng = 12,
    ExportJpg = 13,

    BindDocument = 14,
    UnbindDocument = 15,

    Bold = 16,
    Italic = 17,
    Underline = 18,

    FontName = 19,
    FontSize = 20,
    FontColor = 21,

    FillColor = 22,
    StrokeColor = 23,

    TextLeftAlign = 24,
    TextCenterAlign = 25,
    TextRightAlign = 26,

    ConnectorLineOption = 27,
    ConnectorStartLineEnding = 28,
    ConnectorEndLineEnding = 29,

    BringToFront = 30,
    SendToBack = 31,

    MoveLeft = 32,
    MoveStepLeft = 33,
    MoveRight = 34,
    MoveStepRight = 35,
    MoveUp = 36,
    MoveStepUp = 37,
    MoveDown = 38,
    MoveStepDown = 39,

    CloneLeft = 40,
    CloneRight = 41,
    CloneUp = 42,
    CloneDown = 43,

    AutoLayoutTree = 44,
    AutoLayoutFlow = 45,
    AutoLayoutTreeVertical = 46,
    AutoLayoutTreeHorizontal = 47,
    AutoLayoutLayeredVertical = 48,
    AutoLayoutLayeredHorizontal = 49,

    Lock = 50,
    Unlock = 51,

    Units = 52,
    ViewUnits = 53,
    PageSize = 54,
    PageLandscape = 55,
    PageColor = 56,
    GridSize = 57,
    ShowGrid = 58,
    SnapToGrid = 59,
    ZoomLevel = 60,
    Fullscreen = 61,
    ToggleSimpleView = 62,
    ToggleReadOnly = 63,
    EditShapeImage = 64,

    FitToScreen = 65,
    SwitchAutoZoom = 66,
    ToggleAutoZoom = 67,
    FitToWidth = 68,

    ZoomLevelItems = 69,
    GridSizeItems = 70,
    PageSizeItems = 71,

    ImportXML = 72,
    InsertShapeImage = 73,
    DeleteShapeImage = 74,

    StrokeStyle = 75,
    StrokeWidth = 76,

    AutoLayoutTreeVerticalBottomToTop = 77,
    AutoLayoutTreeHorizontalRightToLeft = 78,
    AutoLayoutLayeredVerticalBottomToTop = 79,
    AutoLayoutLayeredHorizontalRightToLeft = 80,

    Zoom25 = 81,
    Zoom50 = 82,
    Zoom75 = 83,
    Zoom100 = 84,
    Zoom125 = 85,
    Zoom150 = 86,
    Zoom200 = 87,

    AutoZoomToContent = 88,
    AutoZoomToWidth = 89,

    ZoomLevelInPercentage = 90,

    ConnectorRoutingMode = 91
}

export class CommandManager {
    private commands: { [key: number]: ICommand } = {};
    private shortcutsToCommand: { [code: number]: ICommand } = {};

    private lastCommandsChain: ICommand[] = [];
    private executingCommandsChain: ICommand[] = [];
    private executingCommandCounter: number = 0;
    public isPublicApiCall: boolean = false;

    constructor(control: DiagramControl) {
        this.createCommand(control, DiagramCommand.Undo, UndoCommand, ModifierKey.Ctrl | KeyCode.Key_z, ModifierKey.Meta | KeyCode.Key_z);
        this.createCommand(control, DiagramCommand.Redo, RedoCommand,
            ModifierKey.Ctrl | KeyCode.Key_y,
            ModifierKey.Ctrl | ModifierKey.Shift | KeyCode.Key_z,
            ModifierKey.Meta | ModifierKey.Shift | KeyCode.Key_z
        );

        this.createCommand(control, DiagramCommand.Cut, CutSelectionCommand, KeyCode.Key_x | ModifierKey.Ctrl, KeyCode.Key_x | ModifierKey.Meta, KeyCode.Delete | ModifierKey.Shift);
        this.createCommand(control, DiagramCommand.Copy, CopySelectionCommand, KeyCode.Key_c | ModifierKey.Ctrl, KeyCode.Key_c | ModifierKey.Meta, KeyCode.Insert | ModifierKey.Ctrl);
        this.createCommand(control, DiagramCommand.Paste, PasteSelectionCommand);
        this.createCommand(control, DiagramCommand.PasteInPosition, PasteSelectionInPositionCommand);
        this.createCommand(control, DiagramCommand.SelectAll, SelectAllCommand, KeyCode.Key_a | ModifierKey.Ctrl, KeyCode.Key_a | ModifierKey.Meta);
        this.createCommand(control, DiagramCommand.Delete, DeleteCommand, KeyCode.Delete, KeyCode.Backspace);

        this.createCommand(control, DiagramCommand.Import, ImportCommand);
        this.createCommand(control, DiagramCommand.ImportBPMN, ImportBPMNCommand);
        this.createCommand(control, DiagramCommand.ImportXML, ImportXMLCommand);
        this.createCommand(control, DiagramCommand.Export, ExportCommand);
        this.createCommand(control, DiagramCommand.ExportSvg, ExportSvgCommand);
        this.createCommand(control, DiagramCommand.ExportPng, ExportPngCommand);
        this.createCommand(control, DiagramCommand.ExportJpg, ExportJpgCommand);

        this.createCommand(control, DiagramCommand.BindDocument, BindDocumentCommand);
        this.createCommand(control, DiagramCommand.UnbindDocument, UnbindDocumentCommand);

        this.createCommand(control, DiagramCommand.Bold, ToggleFontBoldCommand, ModifierKey.Ctrl | KeyCode.Key_b, ModifierKey.Meta | KeyCode.Key_b);
        this.createCommand(control, DiagramCommand.Italic, ToggleFontItalicCommand, ModifierKey.Ctrl | KeyCode.Key_i, ModifierKey.Meta | KeyCode.Key_i);
        this.createCommand(control, DiagramCommand.Underline, ToggleFontUnderlineCommand, ModifierKey.Ctrl | KeyCode.Key_u, ModifierKey.Meta | KeyCode.Key_u);

        this.createCommand(control, DiagramCommand.FontName, ChangeFontNameCommand);
        this.createCommand(control, DiagramCommand.FontSize, ChangeFontSizeCommand);
        this.createCommand(control, DiagramCommand.FontColor, ChangeFontColorCommand);

        this.createCommand(control, DiagramCommand.FillColor, ChangeFillColorCommand);
        this.createCommand(control, DiagramCommand.StrokeColor, ChangeStrokeColorCommand);
        this.createCommand(control, DiagramCommand.StrokeStyle, ChangeStrokeStyleCommand);
        this.createCommand(control, DiagramCommand.StrokeWidth, ChangeStrokeWidthCommand);

        this.createCommand(control, DiagramCommand.TextLeftAlign, TextLeftAlignCommand);
        this.createCommand(control, DiagramCommand.TextCenterAlign, TextCenterAlignCommand);
        this.createCommand(control, DiagramCommand.TextRightAlign, TextRightAlignCommand);

        this.createCommand(control, DiagramCommand.ConnectorLineOption, ChangeConnectorLineOptionCommand);
        this.createCommand(control, DiagramCommand.ConnectorStartLineEnding, ChangeConnectorStartLineEndingCommand);
        this.createCommand(control, DiagramCommand.ConnectorEndLineEnding, ChangeConnectorEndLineEndingCommand);

        this.createCommand(control, DiagramCommand.BringToFront, BringToFrontCommand);
        this.createCommand(control, DiagramCommand.SendToBack, SendToBackCommand);

        this.createCommand(control, DiagramCommand.MoveLeft, MoveLeftCommand, ModifierKey.Ctrl | KeyCode.Left, ModifierKey.Ctrl | ModifierKey.Shift | KeyCode.Left);
        this.createCommand(control, DiagramCommand.MoveRight, MoveRightCommand, ModifierKey.Ctrl | KeyCode.Right, ModifierKey.Ctrl | ModifierKey.Shift | KeyCode.Right);
        this.createCommand(control, DiagramCommand.MoveUp, MoveUpCommand, ModifierKey.Ctrl | KeyCode.Up, ModifierKey.Ctrl | ModifierKey.Shift | KeyCode.Up);
        this.createCommand(control, DiagramCommand.MoveDown, MoveDownCommand, ModifierKey.Ctrl | KeyCode.Down, ModifierKey.Ctrl | ModifierKey.Shift | KeyCode.Down);

        this.createCommand(control, DiagramCommand.MoveStepLeft, MoveStepLeftCommand, KeyCode.Left, ModifierKey.Shift | KeyCode.Left);
        this.createCommand(control, DiagramCommand.MoveStepRight, MoveStepRightCommand, KeyCode.Right, ModifierKey.Shift | KeyCode.Right);
        this.createCommand(control, DiagramCommand.MoveStepUp, MoveStepUpCommand, KeyCode.Up, ModifierKey.Shift | KeyCode.Up);
        this.createCommand(control, DiagramCommand.MoveStepDown, MoveStepDownCommand, KeyCode.Down, ModifierKey.Shift | KeyCode.Down);

        this.createCommand(control, DiagramCommand.CloneLeft, CloneLeftCommand, ModifierKey.Alt | KeyCode.Left, ModifierKey.Alt | ModifierKey.Shift | KeyCode.Left);
        this.createCommand(control, DiagramCommand.CloneRight, CloneRightCommand, ModifierKey.Alt | KeyCode.Right, ModifierKey.Alt | ModifierKey.Shift | KeyCode.Right);
        this.createCommand(control, DiagramCommand.CloneUp, CloneUpCommand, ModifierKey.Alt | KeyCode.Up, ModifierKey.Alt | ModifierKey.Shift | KeyCode.Up);
        this.createCommand(control, DiagramCommand.CloneDown, CloneDownCommand, ModifierKey.Alt | KeyCode.Down, ModifierKey.Alt | ModifierKey.Shift | KeyCode.Down);

        this.createCommand(control, DiagramCommand.Lock, LockCommand);
        this.createCommand(control, DiagramCommand.Unlock, UnLockCommand);

        this.createCommand(control, DiagramCommand.AutoLayoutTree, AutoLayoutTreeVerticalCommand); 
        this.createCommand(control, DiagramCommand.AutoLayoutFlow, AutoLayoutLayeredHorizontalCommand); 

        this.createCommand(control, DiagramCommand.Units, ChangeUnitsCommand);
        this.createCommand(control, DiagramCommand.ViewUnits, ChangeViewUnitsCommand);
        this.createCommand(control, DiagramCommand.PageSize, ChangePageSizeCommand);
        this.createCommand(control, DiagramCommand.PageLandscape, ChangePageLandscapeCommand);
        this.createCommand(control, DiagramCommand.PageColor, ChangePageColorCommand);
        this.createCommand(control, DiagramCommand.GridSize, ChangeGridSizeCommand);
        this.createCommand(control, DiagramCommand.ShowGrid, ChangeShowGridCommand);
        this.createCommand(control, DiagramCommand.SnapToGrid, ChangeSnapToGridCommand);
        this.createCommand(control, DiagramCommand.ZoomLevel, ChangeZoomLevelCommand);
        this.createCommand(control, DiagramCommand.ZoomLevelInPercentage, ChangeZoomLevelInPercentageCommand);

        this.createCommand(control, DiagramCommand.AutoLayoutTreeVertical, AutoLayoutTreeVerticalCommand);
        this.createCommand(control, DiagramCommand.AutoLayoutTreeVerticalBottomToTop, AutoLayoutTreeVerticalBottomToTopCommand);
        this.createCommand(control, DiagramCommand.AutoLayoutTreeHorizontal, AutoLayoutTreeHorizontalCommand);
        this.createCommand(control, DiagramCommand.AutoLayoutTreeHorizontalRightToLeft, AutoLayoutTreeHorizontalRightToLeftCommand);
        this.createCommand(control, DiagramCommand.AutoLayoutLayeredVertical, AutoLayoutLayeredVerticalCommand);
        this.createCommand(control, DiagramCommand.AutoLayoutLayeredVerticalBottomToTop, AutoLayoutLayeredVerticalBottomToTopCommand);
        this.createCommand(control, DiagramCommand.AutoLayoutLayeredHorizontal, AutoLayoutLayeredHorizontalCommand);
        this.createCommand(control, DiagramCommand.AutoLayoutLayeredHorizontalRightToLeft, AutoLayoutLayeredHorizontalRightToLeftCommand);

        this.createCommand(control, DiagramCommand.Fullscreen, ToggleFullscreenCommand, KeyCode.F11);
        this.createCommand(control, DiagramCommand.ToggleSimpleView, ToggleSimpleViewCommand);
        this.createCommand(control, DiagramCommand.ToggleReadOnly, ToggleReadOnlyCommand);

        this.createCommand(control, DiagramCommand.InsertShapeImage, InsertShapeImageCommand);
        this.createCommand(control, DiagramCommand.EditShapeImage, EditShapeImageCommand);
        this.createCommand(control, DiagramCommand.DeleteShapeImage, DeleteShapeImageCommand);
        this.createCommand(control, DiagramCommand.FitToScreen, FitToScreenCommand);
        this.createCommand(control, DiagramCommand.FitToWidth, FitToWidthCommand);
        this.createCommand(control, DiagramCommand.SwitchAutoZoom, SwitchAutoZoomCommand);
        this.createCommand(control, DiagramCommand.ToggleAutoZoom, ToggleAutoZoomCommand);

        this.createCommand(control, DiagramCommand.ZoomLevelItems, ChangeZoomLevelItemsCommand);
        this.createCommand(control, DiagramCommand.GridSizeItems, ChangeGridSizeItemsCommand);
        this.createCommand(control, DiagramCommand.PageSizeItems, ChangePageSizeItemsCommand);

        this.createCommand(control, DiagramCommand.Zoom25, ChangeZoomLevelTo25Command);
        this.createCommand(control, DiagramCommand.Zoom50, ChangeZoomLevelTo50Command);
        this.createCommand(control, DiagramCommand.Zoom75, ChangeZoomLevelTo75Command);
        this.createCommand(control, DiagramCommand.Zoom100, ChangeZoomLevelTo100Command);
        this.createCommand(control, DiagramCommand.Zoom125, ChangeZoomLevelTo125Command);
        this.createCommand(control, DiagramCommand.Zoom150, ChangeZoomLevelTo150Command);
        this.createCommand(control, DiagramCommand.Zoom200, ChangeZoomLevelTo200Command);

        this.createCommand(control, DiagramCommand.AutoZoomToContent, ToggleAutoZoomToContentCommand);
        this.createCommand(control, DiagramCommand.AutoZoomToWidth, ToggleAutoZoomToWidthCommand);

        this.createCommand(control, DiagramCommand.ConnectorRoutingMode, ChangeConnectorRoutingModeCommand);
    }

    public getCommand(key: DiagramCommand) {
        return this.commands[key];
    }

    public beforeExecuting(command: ICommand) {
        this.executingCommandsChain.push(command);
        this.executingCommandCounter++;
    }

    public afterExecuting() {
        this.executingCommandCounter--;
        if(this.executingCommandCounter === 0) {
            this.lastCommandsChain = this.executingCommandsChain;
            this.executingCommandsChain = [];
        }
    }
    processShortcut(code: number): boolean {
        const command = this.shortcutsToCommand[code];
        if(command)
            return command.execute();
        return false;
    }
    processPaste(clipboardData: string): boolean {
        const command = <PasteSelectionCommand> this.getCommand(DiagramCommand.Paste);
        if(command && command.isEnabled())
            command.execute(clipboardData);
        return true;
    }

    notifySelectionChanged(_selection: Selection) {
        this.lastCommandsChain = [];
    }
    notifyScrollPositionChanged() { }

    protected createCommand(control: DiagramControl, commandId: DiagramCommand, commandType: new (control: DiagramControl) => ICommand, ...shortcuts: number[]) {
        this.commands[commandId] = new commandType(control);
        for(let i = 0; i < shortcuts.length; i++) {
            const shortcut = shortcuts[i];
            if(typeof shortcut === "number")
                this.shortcutsToCommand[shortcut] = this.commands[commandId];
        }
    }
}
