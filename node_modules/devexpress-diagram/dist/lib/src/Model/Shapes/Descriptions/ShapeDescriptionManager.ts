import { ShapeDescription, IShapeDescriptionChangesListener } from "./ShapeDescription";
import { ProcessShapeDescription } from "./Flowchart/ProcessShapeDescription";
import { DecisionShapeDescription } from "./Flowchart/DecisionShapeDescription";
import { ManualInputShapeDescription } from "./Flowchart/ManualInputShapeDescription";
import { DataShapeDescription } from "./Flowchart/DataShapeDescription";
import { TerminatorShapeDescription } from "./Flowchart/TerminatorShapeDescription";
import { PredefinedProcessShapeDescription } from "./Flowchart/PredefinedProcessShapeDescription";
import { ArrowUpDownShapeDescription } from "./General/ArrowUpDownShapeDescription";
import { ArrowRightShapeDescription } from "./General/ArrowRightShapeDescription";
import { ArrowUpShapeDescription } from "./General/ArrowUpShapeDescription";
import { CrossShapeDescription } from "./General/CrossShapeDescription";
import { DiamondShapeDescription } from "./General/DiamondShapeDescription";
import { EllipseShapeDescription } from "./General/EllipseShapeDescription";
import { HeartShapeDescription } from "./General/HeartShapeDescription";
import { RectangleShapeDescription } from "./General/RectangleShapeDescription";
import { TextShapeDescription } from "./General/TextShapeDescription";
import { PentagonShapeDescription } from "./General/PentagonShapeDescription";
import { HexagonShapeDescription } from "./General/HexagonShapeDescription";
import { OctagonShapeDescription } from "./General/OctagonShapeDescription";
import { StarShapeDescription } from "./General/StarShapeDescription";
import { ArrowDownShapeDescription } from "./General/ArrowDownShapeDescription";
import { ArrowLeftRightShapeDescription } from "./General/ArrowLeftRightShapeDescription";
import { ArrowLeftShapeDescription } from "./General/ArrowLeftShapeDescription";
import { TriangleShapeDescription } from "./General/TriangleShapeDescription";
import { DocumentShapeDescription } from "./Flowchart/DocumentShapeDescription";
import { MultipleDocumentsShapeDescription } from "./Flowchart/MultipleDocumentsShapeDescription";
import { PreparationShapeDescription } from "./Flowchart/PreparationShapeDescription";
import { HardDiskShapeDescription } from "./Flowchart/HardDiskShapeDescription";
import { DatabaseShapeDescription } from "./Flowchart/DatabaseShapeDescription";
import { InternalStorageShapeDescription } from "./Flowchart/InternalStorageShapeDescription";
import { PaperTapeShapeDescription } from "./Flowchart/PaperTapeShapeDescription";
import { ManualOperationShapeDescription } from "./Flowchart/ManualOperationShapeDescription";
import { DelayShapeDescription } from "./Flowchart/DelayShapeDescription";
import { StoredDataShapeDescription } from "./Flowchart/StoredDataShapeDescription";
import { MergeShapeDescription } from "./Flowchart/MergeShapeDescription";
import { DisplayShapeDescription } from "./Flowchart/DisplayShapeDescription";
import { OrShapeDescription } from "./Flowchart/OrShapeDescription";
import { SummingJunctionShapeDescription } from "./Flowchart/SummingJunctionShapeDescription";
import { CustomShapeDescription } from "./CustomShapeDescription";
import { ICustomShape } from "../../../Interfaces";
import { VerticalContainerDescription } from "./Containers/VerticalContainerDescription";
import { HorizontalContainerDescription } from "./Containers/HorizontalContainerDescription";
import { CardWithImageOnTopDescription } from "./OrgChart/CardWithImageOnTopDescription";
import { ShapeCategories } from "../ShapeTypes";
import { ConnectorShapeDescription } from "./Flowchart/ConnectorShapeDescription";
import { EventDispatcher } from "../../../Utils";
import { CardWithImageOnLeftDescription, CardWithImageOnRightDescription } from "./OrgChart/CardWithHorizontalImageDescription";

export interface IShapeDescriptionManager {
    get(type: string): ShapeDescription;
    getTypesByCategory(category: string): string[];
    getCategoryByDescription(description: ShapeDescription): string;
}

export class ShapeDescriptionManager implements IShapeDescriptionManager, IShapeDescriptionChangesListener {
    private descriptions: { [key: string]: ShapeDescription } = {};
    private descriptionTypes: { [key: string]: string[] } = {};
    private descriptionCategories: { [key: string]: string } = {};

    private static defaultInstance = new RectangleShapeDescription();
    private static defaultContainerInstance = new VerticalContainerDescription();

    onShapeDecriptionChanged: EventDispatcher<IShapeDescriptionChangesListener> = new EventDispatcher();

    constructor() {
        this.register(new TextShapeDescription(), ShapeCategories.General);
        this.register(new RectangleShapeDescription(), ShapeCategories.General);
        this.register(new EllipseShapeDescription(), ShapeCategories.General);
        this.register(new CrossShapeDescription(), ShapeCategories.General);
        this.register(new TriangleShapeDescription(), ShapeCategories.General);
        this.register(new DiamondShapeDescription(), ShapeCategories.General);
        this.register(new HeartShapeDescription(), ShapeCategories.General);
        this.register(new PentagonShapeDescription(), ShapeCategories.General);
        this.register(new HexagonShapeDescription(), ShapeCategories.General);
        this.register(new OctagonShapeDescription(), ShapeCategories.General);
        this.register(new StarShapeDescription(), ShapeCategories.General);
        this.register(new ArrowUpShapeDescription(), ShapeCategories.General);
        this.register(new ArrowDownShapeDescription(), ShapeCategories.General);
        this.register(new ArrowLeftShapeDescription(), ShapeCategories.General);
        this.register(new ArrowRightShapeDescription(), ShapeCategories.General);
        this.register(new ArrowUpDownShapeDescription(), ShapeCategories.General);
        this.register(new ArrowLeftRightShapeDescription(), ShapeCategories.General);

        this.register(new ProcessShapeDescription(), ShapeCategories.Flowchart);
        this.register(new DecisionShapeDescription(), ShapeCategories.Flowchart);
        this.register(new TerminatorShapeDescription(), ShapeCategories.Flowchart);
        this.register(new PredefinedProcessShapeDescription(), ShapeCategories.Flowchart);
        this.register(new DocumentShapeDescription(), ShapeCategories.Flowchart);
        this.register(new MultipleDocumentsShapeDescription(), ShapeCategories.Flowchart);
        this.register(new ManualInputShapeDescription(), ShapeCategories.Flowchart);
        this.register(new PreparationShapeDescription(), ShapeCategories.Flowchart);
        this.register(new DataShapeDescription(), ShapeCategories.Flowchart);
        this.register(new DatabaseShapeDescription(), ShapeCategories.Flowchart);
        this.register(new HardDiskShapeDescription(), ShapeCategories.Flowchart);
        this.register(new InternalStorageShapeDescription(), ShapeCategories.Flowchart);
        this.register(new PaperTapeShapeDescription(), ShapeCategories.Flowchart);
        this.register(new ManualOperationShapeDescription(), ShapeCategories.Flowchart);
        this.register(new DelayShapeDescription(), ShapeCategories.Flowchart);
        this.register(new StoredDataShapeDescription(), ShapeCategories.Flowchart);
        this.register(new DisplayShapeDescription(), ShapeCategories.Flowchart);
        this.register(new MergeShapeDescription(), ShapeCategories.Flowchart);
        this.register(new ConnectorShapeDescription(), ShapeCategories.Flowchart);
        this.register(new OrShapeDescription(), ShapeCategories.Flowchart);
        this.register(new SummingJunctionShapeDescription(), ShapeCategories.Flowchart);

        this.register(new CardWithImageOnLeftDescription(), ShapeCategories.OrgChart);
        this.register(new CardWithImageOnRightDescription(), ShapeCategories.OrgChart);
        this.register(new CardWithImageOnTopDescription(), ShapeCategories.OrgChart);

        this.register(new VerticalContainerDescription(), ShapeCategories.Containers);
        this.register(new HorizontalContainerDescription(), ShapeCategories.Containers);
    }

    static get default() {
        return ShapeDescriptionManager.defaultInstance;
    }
    static get defaultContainer() {
        return ShapeDescriptionManager.defaultContainerInstance;
    }

    get(type: string): ShapeDescription {
        return this.descriptions[type];
    }
    getTypesByCategory(category: string): string[] {
        return this.descriptionTypes[category] || [];
    }
    getCategoryByType(type: string): string {
        return this.descriptionCategories[type];
    }
    getCategoryByDescription(description: ShapeDescription): string {
        return this.getCategoryByType(description.key);
    }
    register(description: ShapeDescription, category: string, type: string = description.key) {
        if(this.descriptions[type] !== undefined)
            throw Error("Description key is duplicated");
        this.descriptions[type] = description;
        if(!this.descriptionTypes[category])
            this.descriptionTypes[category] = [];
        this.descriptionTypes[category].push(type);
        this.descriptionCategories[type] = category;

        description.onChanged.add(this);
    }
    registerCustomShape(shape: ICustomShape): void {
        if(shape.type === undefined)
            throw Error("Custom shape type is not defined");
        if(this.descriptions[shape.type] !== undefined)
            throw Error("Custom shape type is duplicated");

        const baseDescription = shape.baseType && this.descriptions[shape.baseType];
        if(shape.minWidth > shape.maxWidth)
            shape.maxWidth = shape.minWidth;
        if(shape.minHeight > shape.maxHeight)
            shape.maxHeight = shape.minHeight;

        this.register(new CustomShapeDescription(shape, baseDescription), shape.category || ShapeCategories.Custom);
    }
    unregisterCustomShape(shapeType: string): void {
        const description = this.descriptions[shapeType];
        if(description instanceof CustomShapeDescription) {
            description.onChanged.remove(this);

            const category = this.descriptionCategories[shapeType];
            delete this.descriptions[shapeType];
            delete this.descriptionCategories[shapeType];
            const index = this.descriptionTypes[category].indexOf(shapeType);
            this.descriptionTypes[category].splice(index, 1);
            if(this.descriptionTypes[category].length === 0)
                delete this.descriptionTypes[category];
        }
    }
    unregisterAllCustomShapes(): void {
        Object.keys(this.descriptions).forEach(shapeType => {
            this.unregisterCustomShape(shapeType);
        });
    }

    notifyShapeDescriptionChanged(description: ShapeDescription) {
        this.onShapeDecriptionChanged.raise1(l => l.notifyShapeDescriptionChanged(description));
    }
}
