import { ICloneable } from "@devexpress/utils/lib/types";

export abstract class DialogParametersBase implements ICloneable<DialogParametersBase> {
    abstract clone(): DialogParametersBase;
}
