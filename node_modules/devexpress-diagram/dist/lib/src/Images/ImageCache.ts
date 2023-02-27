import { Base64Utils } from "@devexpress/utils/lib/utils/base64";
import { ImageInfo } from "./ImageInfo";
import { ImageLoader } from "./ImageLoader";
import { EventDispatcher } from "../Utils";

export class CacheImageInfo {
    private _referenceInfo?: CacheImageInfo;
    private _base64?: string;
    private _isLoaded: boolean;
    private _isLoading: boolean;

    actualId?: number;

    imageUrl: string;

    get isLoaded(): boolean { return this._referenceInfo ? this._referenceInfo._isLoaded : this._isLoaded; }
    set isLoaded(val: boolean) { this._isLoaded = val; }
    get base64(): string | undefined { return this._base64; }
    set base64(val: string) { this._base64 = Base64Utils.normalizeToDataUrl(val, "image/png"); }
    get referenceInfo(): CacheImageInfo | undefined { return this._referenceInfo; }
    set referenceInfo(val: CacheImageInfo) {
        this._referenceInfo = val;
        this._base64 = undefined;
        this._isLoaded = undefined;
    }

    constructor(base64?: string, actualId?: number, imageUrl?: string, referenceInfo?: CacheImageInfo, isLoaded?: boolean) {
        this._base64 = base64 !== undefined ? Base64Utils.normalizeToDataUrl(base64, "image/png") : undefined;
        this.actualId = actualId;
        this._referenceInfo = referenceInfo;
        this._isLoaded = isLoaded !== undefined ? isLoaded : false;
        this.imageUrl = imageUrl;
    }

    get isLoading(): boolean { return this._referenceInfo ? this.referenceInfo._isLoading : this._isLoading; }
    startLoading() {
        if(this._referenceInfo)
            this._referenceInfo.startLoading();
        else
            this._isLoading = true;
    }
    finalizeLoading() {
        if(this._referenceInfo)
            this._referenceInfo.finalizeLoading();
        else
            this._isLoading = false;
    }
}

export class ImageCache {
    private cache: CacheImageInfo[];
    public readonly emptyImageId: number = 0;
    private lastActualId: number = 0;
    private nonLoadedImages: CacheImageInfo[];

    onReadyStateChanged: EventDispatcher<IImageCacheChangesListener> = new EventDispatcher();

    private constructor() {
        this.cache = [];
        this.nonLoadedImages = [];
        const emptyImage = this.createUnloadedInfoByBase64(ImageInfo.transparentOnePixelImage);
        emptyImage.isLoaded = true;
    }

    static readonly instance = new ImageCache();

    reset() {
        this.cache.splice(1);
        this.nonLoadedImages = [];
        this.lastActualId = 1;
    }

    get emptyImage(): CacheImageInfo { return this.cache[this.emptyImageId]; }

    getImageData(id: number): CacheImageInfo {
        return this.cache[id];
    }
    private createUnloadedInfoByUrl(imageUrl: string): CacheImageInfo {
        const info: CacheImageInfo = this.findInfoByUrl(imageUrl);
        if(info)
            return info;
        return this.registerImageData(
            new CacheImageInfo(undefined, this.getNextActualId(), imageUrl));
    }

    private createUnloadedInfoByBase64(base64: string): CacheImageInfo {
        const info: CacheImageInfo = this.findInfoByBase64(base64);
        if(info)
            return info;
        return this.registerImageData(
            new CacheImageInfo(base64, this.getNextActualId()));
    }

    createUnloadedInfoByShapeImageInfo(imageInfo: ImageInfo) {
        const data = imageInfo.exportUrl;
        return Base64Utils.checkPrependDataUrl(data) ?
            this.createUnloadedInfoByBase64(data) :
            this.createUnloadedInfoByUrl(data);
    }

    private registerImageData(data: CacheImageInfo): CacheImageInfo {
        let existingData = this.cache[data.actualId];
        if(!existingData)
            existingData = data;

        if(data.actualId !== undefined)
            this.cache[data.actualId] = existingData;

        if(data.actualId !== 0) {
            this.nonLoadedImages.push(data);
            if(this.nonLoadedImages.length === 1)
                this.raiseReadyStateChanged(false);
        }
        return existingData;
    }

    loadAllImages(loader: ImageLoader) {
        this.cache.forEach(cacheInfo => {
            if(this.emptyImageId !== cacheInfo.actualId && !cacheInfo.isLoaded && !cacheInfo.isLoading)
                loader.load(cacheInfo);
        });
    }

    finalizeLoading(existingInfo: CacheImageInfo, loadedInfo: CacheImageInfo) {
        existingInfo.finalizeLoading();
        existingInfo.isLoaded = true;

        const imageInfoIndex = this.nonLoadedImages.indexOf(existingInfo);
        this.nonLoadedImages.splice(imageInfoIndex, 1);
        if(this.nonLoadedImages.length === 0)
            this.raiseReadyStateChanged(true);

        if(existingInfo.referenceInfo)
            return;

        if(loadedInfo.base64) {
            const base64 = Base64Utils.normalizeToDataUrl(loadedInfo.base64, "image/png");
            this.cache.forEach(cacheElem => {
                const isReference: boolean = cacheElem.base64 === base64 && cacheElem !== existingInfo && cacheElem.isLoaded;
                if(isReference)
                    existingInfo.referenceInfo = cacheElem.referenceInfo ? cacheElem.referenceInfo : cacheElem;
                return isReference;
            });
            existingInfo.base64 = base64;
        }
    }

    hasNonLoadedImages(): boolean {
        return this.nonLoadedImages.length !== 0;
    }

    private getNextActualId(): number {
        return this.lastActualId++;
    }

    private findInfoByBase64(base64: string): CacheImageInfo | undefined {
        base64 = Base64Utils.normalizeToDataUrl(base64, "image/png");
        return this.findInfoCore(cacheImageInfo => cacheImageInfo.base64 === base64);
    }
    private findInfoByUrl(imageUrl: string): CacheImageInfo | undefined {
        return this.findInfoCore(cacheImageInfo => cacheImageInfo.imageUrl === imageUrl);
    }
    private findInfoCore(callback: (cacheImageInfo: CacheImageInfo) => boolean): CacheImageInfo | undefined {
        let cacheInfo: CacheImageInfo;
        this.cache.forEach(item => {
            if(callback(item))
                cacheInfo = item;
        });
        return cacheInfo;
    }

    private raiseReadyStateChanged(ready: boolean) {
        this.onReadyStateChanged.raise1(l => l.notifyImageCacheReadyStateChanged(ready));
    }
}

export interface IImageCacheChangesListener {
    notifyImageCacheReadyStateChanged(ready: boolean);
}
