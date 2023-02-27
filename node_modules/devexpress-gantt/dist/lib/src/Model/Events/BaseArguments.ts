export abstract class BaseArguments {
    cancel: boolean;
    values: any;
    key: any;

    constructor(key: any) {
        this.cancel = false;
        this.values = { };
        this.key = key;
    }
}
