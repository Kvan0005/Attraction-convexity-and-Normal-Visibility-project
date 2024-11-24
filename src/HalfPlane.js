import { Point } from "./Point.js";
import { isBetween } from "./SPM.js";

export class HalfPlane {
    constructor(p1, p2) {
        if (p1.x > p2.x || (p1.x === p2.x && p1.y > p2.y)) {
            [p1, p2] = [p2, p1];
        }
        this.p1 = p1;
        this.p2 = p2;
        this.a = p2.y - p1.y;
        this.b = p1.x - p2.x;
        this.c = this.a * p1.x + this.b * p1.y;
    }

    isAbove(point) {
        if (this.b === 0) { // half-plane is vertical
            return point.x > this.p1.x;
        }
        return this.a * point.x + this.b * point.y < this.c;
    }
    
    isBelow(point) {
        if (this.b === 0) { // half-plane is vertical
            return point.x < this.p1.x;
        }
        return this.a * point.x + this.b * point.y > this.c;
    }
    
    draw(p) {
        p.stroke("black");
        const scale = 10000; // scale factor to draw the line
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / length;
        const uy = dy / length;
        const extendedP1 = new Point(this.p1.x - ux * scale, this.p1.y - uy * scale);
        const extendedP2 = new Point(this.p2.x + ux * scale, this.p2.y + uy * scale);
        p.line(extendedP1.x, -extendedP1.y, extendedP2.x, -extendedP2.y);
    }
}

export function fromSlopeAndPoint(slope, point) {
    const a = -slope;
    const b = 1;
    const c = a * point.x + b * point.y;
    return new HalfPlane(new Point(0, c / b), point);
}

export function perpendicularFromSlopeAndPoint(slope, point) {
    const perpendicularSlope = -1 / slope;
    return fromSlopeAndPoint(perpendicularSlope, point);
}

export function perpendicularFromTwoPoints(p1, p2, point) {
    if (p1.x === p2.x) { // half-plane is vertical, create a horizontal half-plane
        return new HalfPlane(new Point(point.x - 1, point.y), new Point(point.x + 1, point.y));
    }
    if (p1.y === p2.y) { // half-plane is horizontal, create a vertical half-plane
        return new HalfPlane(new Point(point.x, point.y - 1), new Point(point.x, point.y + 1));
    }
    const slope = (p2.y - p1.y) / (p2.x - p1.x);
    return perpendicularFromSlopeAndPoint(slope, point);
}

export class ConstrainingHalfPlanes {
    constructor(polygon, spt) {
        this.polygon = polygon;
        this.spt = spt;
        this.planes = this.computePlanes();
        console.log(this.planes);
    }

    computePlanes() {
        const planes = [];
        console.log(this.polygon.points);
        this.spt.tree.forEach(([u, v]) => {
            let i = this.polygon.points.indexOf(v);
            let e1 = [this.polygon.points[(i + 1) % this.polygon.points.length], v];
            let e2 = [this.polygon.points[(i - 1) % this.polygon.points.length], v];
            let h1 = perpendicularFromTwoPoints(e1[0], e1[1], v);
            let h2 = perpendicularFromTwoPoints(e2[0], e2[1], v);
            planes.push(h1, h2);
        });
        return planes;
    }
    
    draw(p) {
        this.planes.forEach(plane => {
            plane.draw(p); // Utiliser la méthode draw de HalfPlane qui inverse les coordonnées y
        });
    }
}