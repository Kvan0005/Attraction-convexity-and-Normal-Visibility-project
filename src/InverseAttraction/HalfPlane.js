import { Point, isLeftTurn } from "../Point.js";
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
        if (this.b === 0) { // Vertical half-plane
            return point.x > this.p1.x;
        }
        return this.a * point.x + this.b * point.y < this.c;
    }
    
    isBelow(point) {
        if (this.b === 0) { // Vertical half-plane
            return point.x < this.p1.x;
        }
        return this.a * point.x + this.b * point.y > this.c;
    }
    
    draw(p) {
        p.stroke("black");
        const scale = 10000; // Scale factor to draw the line
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
    if (p1.x === p2.x) { // Vertical line, create a horizontal half-plane
        return new HalfPlane(new Point(point.x - 1, point.y), new Point(point.x + 1, point.y));
    }
    if (p1.y === p2.y) { // Horizontal line, create a vertical half-plane
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
        this.spt.tree.forEach(([u, v]) => {
            let i = this.polygon.points.indexOf(v);
            let pe1 = this.polygon.points[(i - 1) % this.polygon.points.length];
            let pe2 = this.polygon.points[(i + 1) % this.polygon.points.length];
            let h1 = perpendicularFromTwoPoints(pe1, v, v);
            let h2 = perpendicularFromTwoPoints(pe2, v, v);
            halfPlanes.push(h1, h2);

            const key = `${v.x},${v.y}`;
            this.chp[key] = this.determineSubPolygon(u, v, pe1, pe2, h1, h2);
        });
        return halfPlanes;
    }

    determineSubPolygon(u, v, pe1, pe2, h1, h2) {
        let z1, z2, p1, p2, p3, p4;
        let subPolygons;
        if (h1.isBelow(u) === h1.isBelow(pe1) && h2.isBelow(u) === h2.isBelow(pe2)) {
            if (isLeftTurn(pe1, v, pe2) === isLeftTurn(pe1, v, u)) {
                [z1, p1, p2] = this.getProjections(pe2, v);
                subPolygons = this.createSubPolygon(pe1, v, z1, p1, p2);
            } else {
                [z1, p1, p2] = this.getProjections(pe1, v);
                subPolygons = this.createSubPolygon(pe2, v, z1, p1, p2);
            }

        } else if (h1.isBelow(u) === h1.isBelow(pe1)) {
            [z1, p1, p2] = this.getProjections(pe1, v);
            subPolygons = this.createSubPolygon(pe2, v, z1, p1, p2);
        } else if (h2.isBelow(u) === h2.isBelow(pe2)) {
            [z1, p1, p2] = this.getProjections(pe2, v);
            subPolygons = this.createSubPolygon(pe1, v, z1, p1, p2);

        } else {
            let [pu, pv] = this.getPerpendicularsPoints(u, v);
            [z1, p1, p2] = this.getProjections(v, pu);
            [z2, p3, p4] = this.getProjections(v, pv);
            subPolygons = [this.createSubPolygon(pe1, v, z1, p1, p2), this.createSubPolygon(pe2, v, z2, p3, p4)];
        }
        return subPolygons;
    }

    createSubPolygon(pe, v, z, p1, p2) {
        if (isLeftTurn(pe, v, z) === isLeftTurn(v, z, p1)) {
            return [pe, v, z, p1];
        } else {
            return [pe, v, z, p2];
        }
    }

    getProjections(u, v) {
        let projection = [];
        const edges = this.polygon.points.map((point, i) => [point, this.polygon.points[(i + 1) % this.polygon.points.length]]);

        edges.forEach(([p1, p2]) => {
            if ((u.equals(p1) || v.equals(p2)) || (u.equals(p2) || v.equals(p1))) return;
            const intersection = getIntersection(u, v, p1, p2);
            if (intersection) {
                if (projection.length === 0 || isBetween(v, projection[0], intersection)) {
                    projection = [intersection, p1, p2];
                }
            }
        });

        return projection;
    }

    getPerpendicularsPoints(u, v) {
        const dx = v.x - u.x;
        const dy = v.y - u.y;
    
        if (dx === 0) {
            return [
                new Point(v.x + 1, v.y),
                new Point(v.x - 1, v.y) 
            ];
        }
    
        if (dy === 0) {
            return [
                new Point(v.x, v.y + 1),
                new Point(v.x, v.y - 1)
            ];
        }
    
        const perpendicularSlope = -dx / dy;
    
        const point1X = v.x + 1;
        const point1Y = perpendicularSlope * (point1X - v.x) + v.y;
    
        const point2Y = v.y + 1;
        const point2X = (point2Y - v.y) / perpendicularSlope + v.x;
    
        return [
            new Point(point1X, point1Y), // Premier point
            new Point(point2X, point2Y)  // Second point
        ];
    }    
    
    draw(p) {
        this.halfPlanes.forEach(plane => {
            plane.draw(p); // Use the draw method of HalfPlane which inverts the y-coordinates
        });
    }
}