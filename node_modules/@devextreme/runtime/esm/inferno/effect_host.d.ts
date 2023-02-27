export declare const InfernoEffectHost: {
    lockCount: number;
    lock: () => void;
    callbacks: Array<() => void>;
    callEffects: () => void;
};
