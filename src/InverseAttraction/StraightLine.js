import { Point } from "../geometry/Point.js";
import { isBetween } from "./SPM.js";

export class StraightLine {
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

    isOn(p, epsilon = 1e-10) {
        const value = this.a * p.x + this.b * p.y;
        return Math.abs(value - this.c) < epsilon;
    }

    getIntersection(p3, p4) {
        const a1 = this.p2.x === this.p1.x ? null : (this.p2.y - this.p1.y) / (this.p2.x - this.p1.x);
        const a2 = p4.x === p3.x ? null : (p4.y - p3.y) / (p4.x - p3.x);

        if (a1 === a2) return null; // Lines are parallel

        let x, y;
        if (a1 === null) { // this line is vertical
            x = this.p1.x;
            y = a2 * x + (p3.y - a2 * p3.x);
        } else if (a2 === null) { // p3-p4 line is vertical
            x = p3.x;
            y = a1 * x + (this.p1.y - a1 * this.p1.x);
        } else {
            const b1 = this.p1.y - a1 * this.p1.x;
            const b2 = p3.y - a2 * p3.x;
            x = (b2 - b1) / (a1 - a2);
            y = a1 * x + b1;
        }

        const point = new Point(x, y);
        if (point.equals(this.p1) || point.equals(this.p2)) {
            return null;
        }
        
        if (isBetween(p3, p4, point)) {
            return point;
        }
        return null;
    }
    
    draw(p , color = "black", dashed = false) {
        p.stroke(color);
        if (dashed) {
            p.drawingContext.setLineDash([5, 10]);
        }
        const scale = 10000; // Scale factor to draw the line
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const ux = dx / length;
        const uy = dy / length;
        const extendedP1 = new Point(this.p1.x - ux * scale, this.p1.y - uy * scale);
        const extendedP2 = new Point(this.p2.x + ux * scale, this.p2.y + uy * scale);
        p.line(extendedP1.x, -extendedP1.y, extendedP2.x, -extendedP2.y);
        p.drawingContext.setLineDash([]);
    }
}

export function fromSlopeAndPoint(slope, point) {
    const a = -slope;
    const b = 1;
    const c = a * point.x + b * point.y;
    return new StraightLine(new Point(0, c / b), point);
}

export function perpendicularFromSlopeAndPoint(slope, point) {
    const perpendicularSlope = -1 / slope;
    return fromSlopeAndPoint(perpendicularSlope, point);
}

export function perpendicularFromTwoPoints(p1, p2, point) {
    if (p1.x === p2.x) { // Vertical line, create a horizontal half-plane
        return new StraightLine(new Point(point.x - 1, point.y), new Point(point.x + 1, point.y));
    }
    if (p1.y === p2.y) { // Horizontal line, create a vertical half-plane
        return new StraightLine(new Point(point.x, point.y - 1), new Point(point.x, point.y + 1));
    }
    const slope = (p2.y - p1.y) / (p2.x - p1.x);
    return perpendicularFromSlopeAndPoint(slope, point);
}