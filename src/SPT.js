import { Point } from "./Point.js";
import { Polygon } from "./Polygon.js";

export class SPT {
    constructor(polygon, source) {
        this.polygon = polygon;
        this.source = source;
        this.tree = this.computeSPT();
    }

    computeSPT() {
        const points = this.getReflexVertices();
        const distances = new Map();
        const previous = new Map();
        const queue = [];

        points.forEach(point => {
            distances.set(point, Infinity);
            previous.set(point, null);
            queue.push(point);
        });

        distances.set(this.source, 0);
        queue.push(this.source);

        while (queue.length > 0) {
            queue.sort((a, b) => distances.get(a) - distances.get(b));
            const u = queue.shift();

            points.forEach(v => {
                if (u !== v && !this.polygon.isCutting2(u, v)) {
                    const alt = distances.get(u) + this.distance(u, v);
                    if (alt < distances.get(v)) {
                        distances.set(v, alt);
                        previous.set(v, u);
                    }
                }
            });
        }

        const tree = [];
        points.forEach(point => {
            if (previous.get(point)) {
                tree.push([previous.get(point), point]);
            }
        });
        return tree;
    }

    distance(p1, p2) {
        return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
    }

    getReflexVertices() {
        const points = [];
        for (let i = 0; i < this.polygon.length(); i++) {
            const p1 = this.polygon.get(i);
            const p2 = this.polygon.get((i + 1) % this.polygon.length());
            const p3 = this.polygon.get((i + 2) % this.polygon.length());
            if (this.polygon.isReflex(p1, p2, p3)) {
                points.push(p2);
            }
        }
        return points;
    }

    draw(p) {
        p.stroke("red");
        p.strokeWeight(1);
        this.tree.forEach(([u, v]) => {
            p.line(u.x, -u.y, v.x, -v.y);
        });
    }
}