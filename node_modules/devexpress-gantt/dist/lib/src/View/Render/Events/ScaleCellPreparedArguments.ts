import { ViewType } from "../../Helpers/Enums";

export class ScaleCellPreparedArguments {
    info: Record<string, any>;
    constructor(info? : Record<string, any>) {
        this.info = info;
    }

    public get scaleIndex(): number { return this.info?.scaleIndex; }
    public get scaleType(): ViewType { return this.info?.scaleType; }
    public get start(): Date { return this.info?.range?.start; }
    public get end(): Date { return this.info?.range?.end; }
    public get scaleElement(): HTMLElement { return this.info?.scaleElement; }
    public get separatorElement(): HTMLElement { return this.info?.separatorElement; }
}
