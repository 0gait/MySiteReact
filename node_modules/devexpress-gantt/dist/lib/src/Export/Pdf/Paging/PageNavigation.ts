export class PageNavigation {
    private _top: number;
    private _left: number;
    private _bottom: number;
    private _right: number;
    private _correctedBottoms: Array<number> = new Array<number>();
    vIndex: number = 0;
    hIndex: number = 0;
    pageX: number = 0;
    pageY: number = 0;

    constructor(borders?: Record<string, number>, vIndex?: number, hIndex?: number, pageX?: number, pageY?: number, correctedBottoms?: Array<number>) {
        this._top = borders?.top;
        this._left = borders?.left;
        this._bottom = borders?.bottom;
        this._right = borders?.right;

        this.vIndex = vIndex ?? this.vIndex;
        this.hIndex = hIndex ?? this.hIndex;
        this.pageX = pageX ?? this.pageX;
        this.pageY = pageY ?? this.pageY;
        if(correctedBottoms)
            this._correctedBottoms = correctedBottoms;
    }

    public offset(offsetX: number, offsetY?: number):void {
        if(offsetX)
            this.offsetOneD(offsetX);
        if(offsetY)
            this.offsetOneD(offsetY, true);
    }
    public offsetOneD(delta: number, isVertical?: boolean):void {
        let unplacedSize = delta;
        let spaceToBorder = this.getSpaceToBorder(isVertical);
        while(spaceToBorder < unplacedSize) {
            if(isVertical) {
                this.vIndex++;
                this.pageY = this._top;
            }
            else {
                this.hIndex++;
                this.pageX = this._left;
            }
            unplacedSize -= spaceToBorder;
            spaceToBorder = this.getSpaceToBorder(isVertical);
        }
        if(isVertical)
            this.pageY += unplacedSize;
        else
            this.pageX += unplacedSize;
    }

    public get defaultPageHeight(): number {
        return this.getCurrentPageBottom() - this._top;
    }
    public get defaultPageWidth(): number {
        return this._right - this._left;
    }
    public getPageEnd(isVertical?: boolean): number {
        return isVertical ? this.getCurrentPageBottom() : this._right;
    }
    public getPageStart(isVertical?: boolean): number {
        return isVertical ? this._top : this._left;
    }
    public getPageSize(isVertical?: boolean, index?: number): number {
        return isVertical ? this.getPageHeight(index) : this.defaultPageWidth;
    }
    public getSpaceToBorder(isVertical?: boolean): number {
        return isVertical ? this.getCurrentPageBottom() - this.pageY : this._right - this.pageX;
    }
    public getPageGlobalOffset(index: number, isVertical?: boolean): number {
        if(!isVertical)
            return index * this.defaultPageWidth;
        let offset = 0;
        for(let i = 1; i <= index; i++)
            offset += this.getPageHeight(i - 1);
        return offset;
    }
    public assign(src: PageNavigation): void {
        this._top = src._top;
        this._left = src._left;
        this._bottom = src._bottom;
        this._right = src._right;
        this._correctedBottoms = src._correctedBottoms;

        this.vIndex = src.vIndex;
        this.hIndex = src.hIndex;
        this.pageX = src.pageX;
        this.pageY = src.pageY;
    }
    public static createFrom(src: PageNavigation): PageNavigation {
        const instance = new PageNavigation();
        instance.assign(src);
        return instance;
    }
    public clone(): PageNavigation {
        const instance = new PageNavigation();
        instance.assign(this);
        return instance;
    }
    protected getCurrentPageBottom(): number {
        return this.getPageBottom(this.vIndex);
    }
    protected getPageBottom(index: number): number {
        return this._correctedBottoms[index] ?? this._bottom;
    }
    protected getPageHeight(index: number): number {
        return this.getPageBottom(index) - this._top;
    }
}
