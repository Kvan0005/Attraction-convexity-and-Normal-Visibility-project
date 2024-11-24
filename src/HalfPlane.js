import { Point, isLeftTurn } from "./Point.js";
import { isBetween, getIntersection } from "./SPM.js";

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
        this.chp = {};
        this.halfPlanes = this.computePlanes();
        console.log(this.halfPlanes);
        console.log(this.chp);
    }

    computePlanes() {
        const halfPlanes = [];
        console.log(this.polygon.points);
        let j = 0;
        this.spt.tree.forEach(([u, v]) => {
            if (j !== 3 && j !== 4) {
                j++;
                return;
            }
            let i = this.polygon.points.indexOf(v);
            let pe1 = this.polygon.points[(i - 1) % this.polygon.points.length];
            let pe2 = this.polygon.points[(i + 1) % this.polygon.points.length];
            let h1 = perpendicularFromTwoPoints(pe1, v, v);
            let h2 = perpendicularFromTwoPoints(pe2, v, v);
            halfPlanes.push(h1, h2);

            const key = `${v.x},${v.y}`;
            this.chp[key] = this.determineSubPolygon(u, v, pe1, pe2, h1, h2);

            j++;
        });
        return halfPlanes;
    }

    determineSubPolygon(u, v, pe1, pe2, h1, h2) {
        let z, p1, p2;
        let subPolygon;
        if (h1.isBelow(u) === h1.isBelow(pe1) && h2.isBelow(u) === h2.isBelow(pe2)) {
            if (isLeftTurn(pe1, v, pe2) === isLeftTurn(pe1, v, u)) {
                [z, p1, p2] = this.getProjection(pe2, v);
                subPolygon = this.createSubPolygon(pe1, v, z, p1, p2);
            } else {
                [z, p1, p2] = this.getProjection(pe1, v);
                subPolygon = this.createSubPolygon(pe2, v, z, p1, p2);
            }
        } else if (h1.isBelow(u) === h1.isBelow(pe1)) {
            [z, p1, p2] = this.getProjection(pe1, v);
            subPolygon = this.createSubPolygon(pe2, v, z, p1, p2);
        } else if (h2.isBelow(u) === h2.isBelow(pe2)) {
            [z, p1, p2] = this.getProjection(pe2, v);
            subPolygon = this.createSubPolygon(pe1, v, z, p1, p2);
        } else {
            subPolygon = [h1, pe2, h2, pe1];
        }
        return subPolygon;
    }

    createSubPolygon(pe, v, z, p1, p2) {
        if (isLeftTurn(pe, v, z) === isLeftTurn(v, z, p1)) {
            return [pe, v, z, p1];
        } else {
            return [pe, v, z, p2];
        }
    }

    getProjection(u, v) {
        let projections = [];
        const edges = this.polygon.points.map((point, i) => [point, this.polygon.points[(i + 1) % this.polygon.points.length]]);

        edges.forEach(([p1, p2]) => {
            if ((u.equals(p1) || v.equals(p2)) || (u.equals(p2) || v.equals(p1))) return;
            const intersection = getIntersection(u, v, p1, p2);
            if (intersection && (projections.length === 0 || isBetween(v, projections[0], intersection))) {
                projections = [intersection, p1, p2];
            }
        });
        return projections;
    }
    
    draw(p) {
        this.halfPlanes.forEach(plane => {
            plane.draw(p); // Utiliser la méthode draw de HalfPlane qui inverse les coordonnées y
        });
    }
}