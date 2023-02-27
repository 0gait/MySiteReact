import { SimpleCommandBase } from "../SimpleCommandBase";

export abstract class ClipboardCommand extends SimpleCommandBase {
    static clipboardData: string;

    setClipboardData(data: string) {
        if(this.control.render)
            this.control.render.input.setClipboardData(data);
        ClipboardCommand.clipboardData = data;
    }
    getClipboardData(callback: (data: string) => void) {
        if(this.control.render && this.isPasteSupportedByBrowser())
            this.control.render.input.getClipboardData(callback);
        else
            callback(ClipboardCommand.clipboardData);
    }
    isPasteSupportedByBrowser(): boolean {
        return this.control.render && this.control.render.input.isPasteSupportedByBrowser();
    }
}
