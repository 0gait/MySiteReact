import { ResourceAssignment } from "../../Entities/ResourceAssignment";
import { BaseArguments } from "../BaseArguments";

export class ResourceUnassigningArguments extends BaseArguments {

    constructor(assignment: ResourceAssignment) {
        super(assignment.internalId);
        this.values = assignment;
    }
}
