export class ShapeCategories {
    static readonly General = "general";
    static readonly Flowchart = "flowchart";
    static readonly OrgChart = "orgChart";
    static readonly Containers = "containers";
    static readonly Custom = "custom";
}

export class ShapeTypes {
    static readonly Text = "text";
    static readonly Rectangle = "rectangle";
    static readonly Ellipse = "ellipse";
    static readonly Cross = "cross";
    static readonly Triangle = "triangle";
    static readonly Diamond = "diamond";
    static readonly Heart = "heart";
    static readonly Pentagon = "pentagon";
    static readonly Hexagon = "hexagon";
    static readonly Octagon = "octagon";
    static readonly Star = "star";
    static readonly ArrowLeft = "arrowLeft";
    static readonly ArrowUp = "arrowTop";
    static readonly ArrowRight = "arrowRight";
    static readonly ArrowDown = "arrowBottom";
    static readonly ArrowUpDown = "arrowNorthSouth";
    static readonly ArrowLeftRight = "arrowEastWest";
    static readonly Process = "process";
    static readonly Decision = "decision";
    static readonly Terminator = "terminator";
    static readonly PredefinedProcess = "predefinedProcess";
    static readonly Document = "document";
    static readonly MultipleDocuments = "multipleDocuments";
    static readonly ManualInput = "manualInput";
    static readonly Preparation = "preparation";
    static readonly Data = "data";
    static readonly Database = "database";
    static readonly HardDisk = "hardDisk";
    static readonly InternalStorage = "internalStorage";
    static readonly PaperTape = "paperTape";
    static readonly ManualOperation = "manualOperation";
    static readonly Delay = "delay";
    static readonly StoredData = "storedData";
    static readonly Display = "display";
    static readonly Merge = "merge";
    static readonly Connector = "connector";
    static readonly Or = "or";
    static readonly SummingJunction = "summingJunction";
    static readonly Container = "container"; 
    static readonly VerticalContainer = "verticalContainer";
    static readonly HorizontalContainer = "horizontalContainer";
    static readonly Card = "card"; 
    static readonly CardWithImageOnLeft = "cardWithImageOnLeft";
    static readonly CardWithImageOnTop = "cardWithImageOnTop";
    static readonly CardWithImageOnRight = "cardWithImageOnRight";
}

export enum ShapeType { 
    text,
    rectangle,
    ellipse,
    cross,
    triangle,
    diamond,
    heart,
    pentagon,
    hexagon,
    octagon,
    star,
    arrowLeft,
    arrowTop,
    arrowRight,
    arrowBottom,
    arrowNorthSouth,
    arrowEastWest,

    process,
    decision,
    terminator,
    predefinedProcess,
    document,
    multipleDocuments,
    manualInput,
    preparation,
    data,
    database,
    hardDisk,
    internalStorage,
    paperTape,
    manualOperation,
    delay,
    storedData,
    display,
    merge,
    connector,
    or,
    summingJunction,

    verticalContainer,
    horizontalContainer,

    cardWithImageOnLeft,
    cardWithImageOnTop,
    cardWithImageOnRight
}
