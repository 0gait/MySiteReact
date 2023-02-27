import { CollectionBase } from "./CollectionBase";
import { Dependency } from "../Entities/Dependency";

export class DependencyCollection extends CollectionBase<Dependency> {
    createItem(): Dependency { return new Dependency(); }
}
