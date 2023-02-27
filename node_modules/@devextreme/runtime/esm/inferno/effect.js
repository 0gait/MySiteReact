export class InfernoEffect {
    constructor(effect, dependency) {
        this.dependency = dependency;
        this.effect = effect;
        this.destroy = effect();
    }
    update(dependency) {
        const currentDependency = this.dependency;
        if (dependency) {
            this.dependency = dependency;
        }
        if (!dependency || dependency.some((d, i) => currentDependency[i] !== d)) {
            this.dispose();
            this.destroy = this.effect();
        }
    }
    dispose() {
        if (this.destroy) {
            this.destroy();
        }
    }
}
