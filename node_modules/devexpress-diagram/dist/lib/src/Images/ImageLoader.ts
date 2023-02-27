import { ImageCache, CacheImageInfo } from "./ImageCache";

export class ImageLoader {
    constructor(private loadedCallback: (data: CacheImageInfo) => void) {
    }

    load(data: CacheImageInfo) {
        if(data.isLoaded)
            this.loadedCallback(data);
        else if(!data.isLoading)
            this.loadInner(data);

    }

    loadInner(data: CacheImageInfo): CacheImageInfo {
        if(data.imageUrl)
            this.loadPictureByUrl(data, () => this.finalizeLoading(data, data));
        else if(data.base64)
            this.loadPictureByBase64(data, () => this.finalizeLoading(data, data));
        return data;
    }
    protected finalizeLoading(loadedData: CacheImageInfo, existingInfo?: CacheImageInfo) {
        if(!existingInfo)
            existingInfo = ImageCache.instance.getImageData(loadedData.actualId);
        if(!existingInfo.isLoaded)
            ImageCache.instance.finalizeLoading(existingInfo, loadedData);
        this.loadedCallback(existingInfo);
    }

    protected loadPictureByBase64(data: CacheImageInfo, imageLoaded: (data: CacheImageInfo) => void) {
        const img = new Image();
        img.onload = () => {
            imageLoaded(data);
        };
        img.src = data.base64;
    }
    protected loadPictureByUrl(data: CacheImageInfo, imageLoaded: (data: CacheImageInfo) => void) {
        const xhr = new XMLHttpRequest();
        try {
            xhr.onload = () => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    data.base64 = <string>reader.result;
                    this.loadPictureByBase64(data, (data) => imageLoaded(data));
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.onerror = () => imageLoaded(data);
            xhr.onloadend = () => {
                if(xhr.status === 404)
                    imageLoaded(data);
            };
            xhr.open("GET", data.imageUrl, true);
            xhr.responseType = "blob";
            data.startLoading();
            xhr.send();
        }
        catch{}
    }
}
