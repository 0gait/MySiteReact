export declare class DelayedActionManager {
    private actionTimeout;
    private actionTimeoutId;
    private actionStartTime;
    private action;
    get actionExecuted(): boolean;
    constructor(action: () => void);
    reset(): void;
    start(timeout: number): void;
    executeIfTimerExpired(): void;
    executeAction(): void;
    stop(): void;
}
//# sourceMappingURL=delayed-manager.d.ts.map