import { SimpleCommandState } from "../CommandStates";
import { SimpleCommandBase } from "../SimpleCommandBase";

export class ToggleFullscreenCommand extends SimpleCommandBase {
    isEnabledInReadOnlyMode(): boolean {
        return true;
    }
    getValue(): boolean {
        return this.control.settings.fullscreen;
    }
    executeCore(state: SimpleCommandState, parameter?: boolean | undefined): boolean {
        const newValue = typeof parameter === "boolean" ? parameter : !state.value;
        if(this.control.settings.fullscreen !== newValue) {
            this.control.settings.fullscreen = !state.value;
            this.control.notifyToggleFullscreen(this.control.settings.fullscreen);
        }
        return true;
    }
}
