import { CollectionBase } from "./CollectionBase";
import { ResourceAssignment } from "../Entities/ResourceAssignment";

export class ResourceAssignmentCollection extends CollectionBase<ResourceAssignment> {
    createItem(): ResourceAssignment { return new ResourceAssignment(); }
}
