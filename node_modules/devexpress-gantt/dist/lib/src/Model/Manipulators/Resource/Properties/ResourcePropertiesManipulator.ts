import { ModelChangesDispatcher } from "../../../Dispatchers/ModelChangesDispatcher";
import { ViewVisualModel } from "../../../VisualModel/VisualModel";
import { BaseManipulator } from "../../BaseManipulator";
import { ResourceColorManipulator } from "./ResourceColorManipulator";
import { ResourcePropertyManipulator } from "./ResourcePropertyManipulator";

export class ResourcePropertiesManipulator extends BaseManipulator {
    color: ResourcePropertyManipulator<string>;
    constructor(viewModel: ViewVisualModel, dispatcher: ModelChangesDispatcher) {
        super(viewModel, dispatcher);
        this.color = new ResourceColorManipulator(viewModel, dispatcher);
    }
}
