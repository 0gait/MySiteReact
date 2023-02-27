import { RenderHelper } from "../../View/Render/RenderHelper";
import { ModelChangesDispatcher } from "../Dispatchers/ModelChangesDispatcher";
import { ViewVisualModel } from "../VisualModel/VisualModel";

export class BaseManipulator {
    viewModel: ViewVisualModel;
    dispatcher: ModelChangesDispatcher

    constructor(viewModel: ViewVisualModel, dispatcher: ModelChangesDispatcher) {
        this.viewModel = viewModel;
        this.dispatcher = dispatcher;
    }

    public getErrorCallback(): () => void {
        return this.viewModel.getDataUpdateErrorCallback();
    }

    protected get renderHelper(): RenderHelper {
        return this.viewModel.owner.renderHelper;
    }
}
