export class Phase {
    static DrawAttraction = new Phase('DrawAttraction');
    static ComputeIAR = new Phase('ComputeIAR', Phase.DrawAttraction);
    static DrawPoint = new Phase('DrawPoint', Phase.ComputeIAR);
    static DrawPolygon = new Phase('Draw', Phase.DrawPoint);

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