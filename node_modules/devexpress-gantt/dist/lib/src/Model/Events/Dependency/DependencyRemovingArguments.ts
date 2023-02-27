import { Dependency } from "../../Entities/Dependency";
import { BaseArguments } from "../BaseArguments";

export class DependencyRemovingArguments extends BaseArguments {
    constructor(dependency: Dependency) {
        super(dependency.id);
        this.values = dependency;
    }
}
