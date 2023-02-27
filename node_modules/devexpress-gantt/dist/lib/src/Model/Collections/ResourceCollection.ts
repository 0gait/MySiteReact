import { CollectionBase } from "./CollectionBase";
import { Resource } from "../Entities/Resource";

export class ResourceCollection extends CollectionBase<Resource> {
    createItem(): Resource { return new Resource(); }
}
