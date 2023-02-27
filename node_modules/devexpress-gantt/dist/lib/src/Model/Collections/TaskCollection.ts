import { Task } from "../Entities/Task";
import { CollectionBase } from "./CollectionBase";

export class TaskCollection extends CollectionBase<Task> {
    createItem(): Task { return new Task(); }
}
