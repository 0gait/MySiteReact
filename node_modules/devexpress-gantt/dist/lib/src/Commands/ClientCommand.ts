export enum GanttClientCommand {
    CreateTask = 0,
    CreateSubTask = 1,
    RemoveTask = 2,
    RemoveDependency = 3,
    TaskInformation = 4,
    TaskAddContextItem = 5,
    Undo = 6,
    Redo = 7,
    ZoomIn = 8,
    ZoomOut = 9,
    FullScreen = 10,
    CollapseAll = 11,
    ExpandAll = 12,
    ResourceManager = 13,
    ToggleResources = 14,
    ToggleDependencies = 15
}
