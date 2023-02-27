import { ResourcePropertyManipulator } from "../../../../Manipulators/Resource/Properties/ResourcePropertyManipulator";
import { ResourcePropertiesHistoryItemBase } from "./ResourcePropertiesHistoryItemBase";

export class ResourceColorHistoryItem extends ResourcePropertiesHistoryItemBase<string> {
    getPropertiesManipulator(): ResourcePropertyManipulator<string> {
        return this.modelManipulator.resource.properties.color;
    }
}
