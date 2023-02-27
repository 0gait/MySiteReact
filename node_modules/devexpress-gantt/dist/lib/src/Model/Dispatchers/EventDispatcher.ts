import { IModelChangesListener } from "../../Interfaces/IModelChangesListener";

export class EventDispatcher {
    listeners: IModelChangesListener[] = [];

    public add(listener: IModelChangesListener): void {
        if(!listener)
            throw new Error("Error");
        if(!this.hasEventListener(listener))
            this.listeners.push(listener);
    }
    public remove(listener: IModelChangesListener): void {
        for(let i = 0, currentListener; currentListener = this.listeners[i]; i++)
            if(currentListener === listener) {
                this.listeners.splice(i, 1);
                break;
            }
    }
    public raise(funcName: string, ...args: any[]): void {
        for(let i = 0, listener: IModelChangesListener; listener = this.listeners[i]; i++) {
            const func = listener[<string>funcName];
            func?.apply(listener, args);
        }
    }

    public hasEventListener(listener: IModelChangesListener): boolean {
        for(let i = 0, l = this.listeners.length; i < l; i++)
            if(this.listeners[i] === listener)
                return true;
        return false;
    }
}
