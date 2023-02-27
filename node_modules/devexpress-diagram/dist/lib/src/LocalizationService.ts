import { ShapeTypes } from "./Model/Shapes/ShapeTypes";
import { DiagramUnit } from "./Enums";

export class DiagramLocalizationService {
    public static unitItems: {[key: string]: string} = {};
    public static formatUnit: (value: number) => string = (value: number) => { return value.toString(); };

    public static shapeTexts: {[key: string]: string} = {};
}

DiagramLocalizationService.unitItems[DiagramUnit.In] = "in";
DiagramLocalizationService.unitItems[DiagramUnit.Cm] = "cm";
DiagramLocalizationService.unitItems[DiagramUnit.Px] = "px";

DiagramLocalizationService.shapeTexts[ShapeTypes.Text] = "Text";
DiagramLocalizationService.shapeTexts[ShapeTypes.Rectangle] = "Rectangle";
DiagramLocalizationService.shapeTexts[ShapeTypes.Ellipse] = "Ellipse";
DiagramLocalizationService.shapeTexts[ShapeTypes.Cross] = "Cross";
DiagramLocalizationService.shapeTexts[ShapeTypes.Triangle] = "Triangle";
DiagramLocalizationService.shapeTexts[ShapeTypes.Diamond] = "Diamond";
DiagramLocalizationService.shapeTexts[ShapeTypes.Heart] = "Heart";
DiagramLocalizationService.shapeTexts[ShapeTypes.Pentagon] = "Pentagon";
DiagramLocalizationService.shapeTexts[ShapeTypes.Hexagon] = "Hexagon";
DiagramLocalizationService.shapeTexts[ShapeTypes.Octagon] = "Octagon";
DiagramLocalizationService.shapeTexts[ShapeTypes.Star] = "Star";
DiagramLocalizationService.shapeTexts[ShapeTypes.ArrowLeft] = "Left Arrow";
DiagramLocalizationService.shapeTexts[ShapeTypes.ArrowUp] = "Up Arrow";
DiagramLocalizationService.shapeTexts[ShapeTypes.ArrowRight] = "Right Arrow";
DiagramLocalizationService.shapeTexts[ShapeTypes.ArrowDown] = "Down Arrow";
DiagramLocalizationService.shapeTexts[ShapeTypes.ArrowUpDown] = "Up Down Arrow";
DiagramLocalizationService.shapeTexts[ShapeTypes.ArrowLeftRight] = "Left Right Arrow";
DiagramLocalizationService.shapeTexts[ShapeTypes.Process] = "Process";
DiagramLocalizationService.shapeTexts[ShapeTypes.Decision] = "Decision";
DiagramLocalizationService.shapeTexts[ShapeTypes.Terminator] = "Terminator";
DiagramLocalizationService.shapeTexts[ShapeTypes.PredefinedProcess] = "Predefined Process";
DiagramLocalizationService.shapeTexts[ShapeTypes.Document] = "Document";
DiagramLocalizationService.shapeTexts[ShapeTypes.MultipleDocuments] = "Multiple Documents";
DiagramLocalizationService.shapeTexts[ShapeTypes.ManualInput] = "Manual Input";
DiagramLocalizationService.shapeTexts[ShapeTypes.Preparation] = "Preparation";
DiagramLocalizationService.shapeTexts[ShapeTypes.Data] = "Data";
DiagramLocalizationService.shapeTexts[ShapeTypes.Database] = "Database";
DiagramLocalizationService.shapeTexts[ShapeTypes.HardDisk] = "Hard Disk";
DiagramLocalizationService.shapeTexts[ShapeTypes.InternalStorage] = "Internal Storage";
DiagramLocalizationService.shapeTexts[ShapeTypes.PaperTape] = "Paper Tape";
DiagramLocalizationService.shapeTexts[ShapeTypes.ManualOperation] = "Manual Operation";
DiagramLocalizationService.shapeTexts[ShapeTypes.Delay] = "Delay";
DiagramLocalizationService.shapeTexts[ShapeTypes.StoredData] = "Stored Data";
DiagramLocalizationService.shapeTexts[ShapeTypes.Display] = "Display";
DiagramLocalizationService.shapeTexts[ShapeTypes.Merge] = "Merge";
DiagramLocalizationService.shapeTexts[ShapeTypes.Connector] = "Connector";
DiagramLocalizationService.shapeTexts[ShapeTypes.Or] = "Or";
DiagramLocalizationService.shapeTexts[ShapeTypes.SummingJunction] = "Summing Junction";
DiagramLocalizationService.shapeTexts[ShapeTypes.Container] = "Container";
DiagramLocalizationService.shapeTexts[ShapeTypes.VerticalContainer] = "Vertical Container";
DiagramLocalizationService.shapeTexts[ShapeTypes.HorizontalContainer] = "Horizontal Container";
DiagramLocalizationService.shapeTexts[ShapeTypes.Card] = "Person's Name";
DiagramLocalizationService.shapeTexts[ShapeTypes.CardWithImageOnLeft] = "Card with Image on the Left";
DiagramLocalizationService.shapeTexts[ShapeTypes.CardWithImageOnTop] = "Card with Image on the Top";
DiagramLocalizationService.shapeTexts[ShapeTypes.CardWithImageOnRight] = "Card with Image on the Right";
