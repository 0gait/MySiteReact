import { LayoutSettings, TreeLayoutSettings } from "../Layout/LayoutSettings";
import { IDataLayoutImportParameters } from "./Interfaces";
import { NodeInfo } from "../Layout/NodeLayout";
import { Graph } from "../Layout/Graph";
import { TreeLayoutBuilder } from "../Layout/Builders/WideTree";
import { SugiyamaLayoutBuilder } from "../Layout/Builders/Sugiyama";
import { LayoutBuilder } from "../Layout/Builders/BaseBuilder";
import { IShapeSizeSettings } from "../Settings";

export enum DataLayoutType { Tree, Sugiyama }

export class DataLayoutParameters {
    layoutType: DataLayoutType | undefined;
    layoutSettings: LayoutSettings | undefined;
    skipPointIndices: boolean | undefined;
    autoSizeEnabled: boolean;
    sizeSettings: IShapeSizeSettings;

    constructor(sizeSettings: IShapeSizeSettings, parameter?: IDataLayoutImportParameters) {
        this.sizeSettings = sizeSettings;
        if(parameter) {
            if(parameter.type !== undefined) {
                this.layoutType = parameter.type;
                this.layoutSettings = this.layoutType === DataLayoutType.Sugiyama ? new LayoutSettings() : new TreeLayoutSettings();
            }
            if(parameter.orientation !== undefined)
                this.layoutSettings.orientation = parameter.orientation;
            this.skipPointIndices = parameter.skipPointIndices;
            this.autoSizeEnabled = parameter.autoSizeEnabled;
        }
    }
    get needAutoLayout(): boolean { return this.layoutType !== undefined; }
    getLayoutBuilder(graph: Graph<NodeInfo>): LayoutBuilder<LayoutSettings> {
        return (this.layoutType === DataLayoutType.Tree) ?
            new TreeLayoutBuilder(<TreeLayoutSettings> this.layoutSettings, graph) :
            new SugiyamaLayoutBuilder(this.layoutSettings, graph);
    }
}
