export class Time {
    private _hour: number = 0;
    private _min: number = 0;
    private _sec: number = 0;
    private _msec: number = 0;
    private _fullmsec: number = 0;

    constructor(h: number = 0, min: number = 0, sec: number = 0, msec: number = 0) { 
        this.hour = h;
        this.min = min;
        this.sec = sec;
        this.msec = msec;
    }

    public get hour(): number { return this._hour; }
    public set hour(h: number) {
        if(h >= 0 && h < 24) {
            this._hour = h;
            this.updateFullMilleconds();
        }
    }

    public get min(): number { return this._min; }
    public set min(m: number) {
        if(m >= 0 && m < 60) {
            this._min = m;
            this.updateFullMilleconds();
        }
    }

    public get sec(): number { return this._sec; }
    public set sec(s: number) {
        if(s >= 0 && s < 60) {
            this._sec = s;
            this.updateFullMilleconds();
        }
    }

    public get msec(): number { return this._msec; }
    public set msec(ms: number) {
        if(ms >= 0 && ms < 1000) {
            this._msec = ms;
            this.updateFullMilleconds();
        }
    }

    protected updateFullMilleconds(): void {
        const minutes = this._hour * 60 + this._min;
        const sec = minutes * 60 + this._sec;
        this._fullmsec = sec * 1000 + this._msec;
    }

    public getTimeInMilleconds(): number {
        return this._fullmsec;
    }
}
