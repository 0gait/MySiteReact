import { Resource } from "../../Entities/Resource";
import { BaseArguments } from "../BaseArguments";

export class ResourceRemovingArguments extends BaseArguments {
    constructor(resource: Resource) {
        super(resource.id);
        this.values = resource;
    }
}
