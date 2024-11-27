export class Phase {
    static EndVisible = new Phase('EndVisible');
    static ImagineAnt = new Phase('ImagineAnt', Phase.EndVisible);
    static Explanation = new Phase('Explanation', Phase.ImagineAnt);
    static Draw = new Phase('Draw', Phase.Explanation);

    constructor(name, next) {
        this.name = name;
        this.n = next;
    }

    toString() {
        return `Phase.${this.name}`;
    }

    next() {
        return this.n;
    }
}