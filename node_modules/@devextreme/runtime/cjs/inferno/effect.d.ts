export declare class InfernoEffect {
    private destroy?;
    private effect;
    private dependency;
    constructor(effect: () => (() => void) | void, dependency: Array<unknown>);
    update(dependency?: Array<unknown>): void;
    dispose(): void;
}
