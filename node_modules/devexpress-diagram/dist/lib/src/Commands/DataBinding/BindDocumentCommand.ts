import { ItemKey } from "../../Model/DiagramItem";
import { INodeDataImporter, IEdgeDataImporter, IDataLayoutImportParameters, IDataImportParameters } from "../../Data/Interfaces";
import { DataLayoutParameters } from "../../Data/DataLayoutParameters";
import { SimpleCommandState } from "../CommandStates";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class BindDocumentCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    executeCore(state: SimpleCommandState, parameter: { key: ItemKey, name: string, nodeDataSource: any[], edgeDataSource: any[],
        nodeDataImporter?: INodeDataImporter, edgeDataImporter?: IEdgeDataImporter, layoutParameters?: IDataLayoutImportParameters }): boolean {
        if(!parameter || !Array.isArray(parameter.nodeDataSource))
            throw Error("Format exception");

        this.performImportData(parameter);
        this.control.updateLayout(true);
        return true;
    }
    protected performImportData(parameter: { key: ItemKey, name: string, nodeDataSource: any[], edgeDataSource: any[],
        nodeDataImporter?: INodeDataImporter, edgeDataImporter?: IEdgeDataImporter, layoutParameters?: IDataLayoutImportParameters, dataParameters?: IDataImportParameters }) {
        const dataSource = this.control.createDocumentDataSource(parameter.nodeDataSource, parameter.edgeDataSource, parameter.dataParameters,
            parameter.nodeDataImporter, parameter.edgeDataImporter);
        this.control.beginUpdateCanvas();
        this.permissionsProvider.lockPermissions();
        const layoutParameters = new DataLayoutParameters(this.control.settings, parameter.layoutParameters);
        dataSource.createModelItems(this.control.history, this.control.model, this.control.shapeDescriptionManager,
            this.control.selection, layoutParameters, this.control.settings.snapToGrid, this.control.settings.gridSize, this.control.measurer);
        this.permissionsProvider.unlockPermissions();
        this.control.endUpdateCanvas();
    }
}
