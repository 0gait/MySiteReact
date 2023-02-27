enum LoggerDisplayMode {
    Disabled = 0,
    Console = 1,
    Document = 2
}
export class Diagnostics {
    static mode: LoggerDisplayMode = LoggerDisplayMode.Document;

    static optimizeUsingRAF = true;
    static optimizeLayers = true;

    static timers: { [key: number]: TimerInfo } = {};
    static lastCreatedTimer: TimerInfo;
    static lastAverageGroupName: string;

    static enableLogsAndTimers = false;

    static beginAverage(groupName: string) {
        if(!this.enableLogsAndTimers) return;
        this.lastAverageGroupName = groupName;
    }
    static endAverage() {
        if(!this.enableLogsAndTimers) return;
        this.lastAverageGroupName = null;
    }
    private static tryLogAverage(groupName: string) {
        if(this.lastAverageGroupName === groupName) return;
        const sameGroupTimers = Object.keys(this.timers)
            .map(t => this.timers[t])
            .filter(t => t.groupName === groupName);
        if(!sameGroupTimers.filter(t => !t.endTime).length) {
            const average = sameGroupTimers.reduce((acc, t) => acc + (t.endTime - t.startTime), 0) / sameGroupTimers.length;
            this.log(`average: ${average}`);
        }
    }

    static timer(message: string) {
        if(!this.enableLogsAndTimers) return;
        this.lastCreatedTimer = {
            message: message,
            startTime: performance.now(),
            groupName: this.lastAverageGroupName
        };
    }
    static endTimer() {
        if(!this.enableLogsAndTimers) return;
        const timer = this.lastCreatedTimer;
        const timeoutID = setTimeout(() => {
            timer.endTime = performance.now();
            this.showMessage(`timer "${timer.message}": ${timer.endTime - timer.startTime}`);
            timer.groupName && this.tryLogAverage(timer.groupName);
        }, 0);
        this.timers[timeoutID] = timer;
        this.lastCreatedTimer = null;
    }
    static logPerfInfo() {
        const nodesCount = document.querySelector(".dxdi-control > svg").querySelectorAll("*").length;
        const memory = performance["memory"];
        this.log(`nodes: ${nodesCount.toLocaleString()}${memory ? " memory: " : ""}${memory ? memory["usedJSHeapSize"].toLocaleString() : ""}`);
    }

    static log(message: any) {
        this.showMessage(message);
    }
    static lastMessage: string;
    private static showMessage(message: any) {
        switch(Diagnostics.mode) {
            case LoggerDisplayMode.Console:
                console.log(message);
                break;
            case LoggerDisplayMode.Document: {
                const existText = this.getElement().value;
                if(this.lastMessage === message) {
                    let lastLineLength = existText.indexOf("\r\n");
                    if(lastLineLength < 0)
                        lastLineLength = existText.indexOf("\n");
                    let lastLine = existText.substr(0, lastLineLength);
                    const regex = /( \()([0-9]+)(\))$/;
                    if(regex.test(lastLine))
                        lastLine = lastLine.replace(/( \()([0-9]+)(\))$/, (str, before, val, after) => before + (++val) + after);
                    else
                        lastLine += " (1)";
                    this.getElement().value = lastLine + existText.substr(lastLineLength);
                }
                else {
                    this.getElement().value = message + "\r\n" + existText;
                    this.lastMessage = message;
                }
            }
        }
    }
    private static el: HTMLTextAreaElement;
    private static getElement(): HTMLTextAreaElement {
        if(!this.el) {
            this.el = document.createElement("textarea");
            this.el.style.top = "0px";
            this.el.style.right = "0px";
            this.el.style.position = "fixed";
            this.el.style.background = "transparent";
            this.el.style.fontSize = "11px";
            this.el.style.fontFamily = "monospace";
            this.el.style.overflow = "auto";
            this.el.style.width = "400px";
            document.body.appendChild(this.el);

            const clr = document.createElement("button");
            clr.innerHTML = "x";
            clr.addEventListener("click", () => { this.el.value = ""; this.lastMessage = ""; });
            clr.style.top = "0px";
            clr.style.right = "400px";
            clr.style.position = "fixed";
            clr.style.opacity = "0.1";
            document.body.appendChild(clr);
        }
        return this.el;
    }
}

interface TimerInfo {
    startTime: number;
    message: string;
    endTime?: number;
    groupName?: string;
}
