import { CollectionBase } from "./CollectionBase";
import { WorkingTimeRule } from "../WorkingTime/WorkingTimeRule";

export class WorkingDayRuleCollection extends CollectionBase<WorkingTimeRule> {
    createItem(): WorkingTimeRule { return new WorkingTimeRule(); }
}
