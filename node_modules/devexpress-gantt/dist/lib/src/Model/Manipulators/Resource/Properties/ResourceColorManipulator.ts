import { Resource } from "../../../Entities/Resource";
import { ResourcePropertyManipulator } from "./ResourcePropertyManipulator";

export class ResourceColorManipulator extends ResourcePropertyManipulator<string> {
    getPropertyValue(resource: Resource): string {
        return resource.color;
    }
    setPropertyValue(resource: Resource, value: string): void {
        resource.color = value;
        this.dispatcher.notifyResourceColorChanged(resource.id, value, this.getErrorCallback());
    }
}
