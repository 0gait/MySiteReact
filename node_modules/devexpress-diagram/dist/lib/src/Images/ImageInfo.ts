import { Base64Utils } from "@devexpress/utils/lib/utils/base64";

export class ImageInfo {
    private static transparentWhiteImage1_1: string = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAANSURBVBhXY/j///9/AAn7A/0FQ0XKAAAAAElFTkSuQmCC";

    url: string = undefined;
    base64: string = undefined;
    private loadFailed: boolean;

    constructor(imageUrlOrBase64?: string) {
        if(imageUrlOrBase64)
            if(Base64Utils.checkPrependDataUrl(imageUrlOrBase64))
                this.base64 = imageUrlOrBase64;
            else
                this.url = imageUrlOrBase64;

        this.loadFailed = false;
    }

    clone(): ImageInfo {
        const result = new ImageInfo();
        result.url = this.url;
        result.base64 = this.base64;
        return result;
    }

    get isEmpty(): boolean { return this.url === undefined && this.base64 === undefined; }
    get unableToLoad(): boolean { return this.loadFailed; }
    get renderUrl(): string { return this.base64 || ""; }
    get exportUrl(): string { return this.base64 ? this.base64 : this.url; }
    get actualUrl(): string { return this.url ? this.url : this.base64; }

    static get transparentOnePixelImage(): string { return this.transparentWhiteImage1_1; }

    loadBase64Content(base64Content: string) {
        this.base64 = Base64Utils.normalizeToDataUrl(base64Content, "image/png");
    }
    setUnableToLoadFlag() {
        this.loadFailed = true;
    }
}
