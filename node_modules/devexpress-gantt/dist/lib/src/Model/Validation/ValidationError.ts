export class ValidationError {
    dependencyId: string;
    critical: boolean;
    constructor(dependencyId: string, critical: boolean = false) {
        this.dependencyId = dependencyId;
        this.critical = critical;
    }
}
