export enum ViewType { TenMinutes, Hours, SixHours, Days, Weeks, Months, Quarter, Years, FiveYears}
export enum Position { Left, Top, Right, Bottom }
export enum TaskTitlePosition { Inside, Outside, None }
export enum TaskAreaEventSource {
    TaskArea,
    TaskEdit_Frame,
    TaskEdit_Progress,
    TaskEdit_Start,
    TaskEdit_End,
    TaskEdit_DependencyStart,
    TaskEdit_DependencyFinish,

    Successor_Wrapper,
    Successor_DependencyStart,
    Successor_DependencyFinish
}
