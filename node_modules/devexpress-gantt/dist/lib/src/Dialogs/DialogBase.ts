import { CommandBase } from "../Commands/CommandBase";
import { SimpleCommandState } from "../Commands/SimpleCommandState";
import { GanttView } from "../View/GanttView";
import { DialogParametersBase } from "./DialogParameters/DialogParametersBase";

export interface IDialogRefreshable {
    refresh(): void;
    get canRefresh(): boolean;
    getDialogName(): string;
}

export abstract class DialogBase<InitialParametersT extends DialogParametersBase> extends CommandBase<SimpleCommandState> implements IDialogRefreshable {
    control: GanttView;
    public static activeInstance: IDialogRefreshable = null;
    protected options: unknown;
    protected isApiCall: boolean = false;
    public execute(options: any = undefined, isApiCall: boolean = false): boolean {
        this.isApiCall = isApiCall;
        return super.execute(options);
    }
    executeInternal(options: unknown): boolean {
        this.options = options;
        return this.showDialog(options);
    }
    private _canRefresh: boolean = true;
    public get canRefresh(): boolean { return this._canRefresh; }
    public refresh(): void {
        this.showDialog(this.options);
    }
    showDialog(options: unknown): boolean {
        const params: InitialParametersT = this.createParameters(options);
        const initParams: InitialParametersT = <InitialParametersT>params.clone();
        if(!this.onBeforeDialogShow(params))
            return false;

        DialogBase.activeInstance = this;
        this.control.showDialog(this.getDialogName(), params, (result: InitialParametersT) => {
            if(result) {
                this._canRefresh = false;
                this.applyParameters(result, initParams);
                this._canRefresh = true;
            }
        }, () => {
            delete DialogBase.activeInstance;
            this.afterClosing();
        });
        return true;
    }
    abstract createParameters(options: any): InitialParametersT;
    abstract getDialogName(): string;
    onBeforeDialogShow(params: InitialParametersT): boolean {
        return true;
    }

    applyParameters(_newParameters: InitialParametersT, _oldParameters: InitialParametersT): boolean {
        return false;
    }
    afterClosing(): void { }

    public getState(): SimpleCommandState {
        return new SimpleCommandState(this.isEnabled());
    }
}
