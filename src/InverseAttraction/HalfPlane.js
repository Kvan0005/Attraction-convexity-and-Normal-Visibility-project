import { Point, isLeftTurn } from "../Point.js";
import { isBetween, getIntersection } from "./SPM.js";
import { StraightLine, perpendicularFromTwoPoints } from "./StraightLine.js";

export class HalfPlane {
    constructor(h, p1) {
        this.h = h;
        this.p1 = p1;
    }

    isIn(p) {
        return this.h.isBelow(p) === this.h.isBelow(this.p1);
    }

    isOn(p) {
        return this.h.isOn(p);
    }

    getIntersection(p1, p2) {
        return this.h.getIntersection(p1, p2);
    }

    draw(p) {
        this.h.draw(p);
    }
}


export class ConstrainingHalfPlanes {
    constructor(polygon, spt) {
        this.polygon = polygon;
        this.spt = spt;
        this.chp = {};
        this.straightLines = this.computePlanes();
    }

    computePlanes() {
        const straightLines = [];
        console.log(this.polygon.points);
        this.spt.tree.forEach(([u, v]) => {

            let i = this.polygon.points.indexOf(v);
            let pe1 = this.polygon.points[(i - 1) % this.polygon.points.length];
            let pe2 = this.polygon.points[(i + 1) % this.polygon.points.length];
            let h1 = perpendicularFromTwoPoints(pe1, v, v);
            let h2 = perpendicularFromTwoPoints(pe2, v, v);
            straightLines.push(h1, h2);

            const key = JSON.stringify({x: v.x, y: v.y});
            this.chp[key] = this.determineSubPolygon(u, v, pe1, pe2, h1, h2);
        });
        return straightLines;
    }

    determineSubPolygon(u, v, pe1, pe2, h1, h2) {
        let z1, z2, p1, p2, p3, p4;
        let subPolygons;
        let associatedLine;
        if (h1.isBelow(u) === h1.isBelow(pe1) && h2.isBelow(u) === h2.isBelow(pe2)) {
            if (isLeftTurn(pe1, v, pe2) === isLeftTurn(pe1, v, u)) {
                [z1, p1, p2] = this.getProjections(pe2, v);
                subPolygons = this.createSubPolygon(pe1, v, z1, p1, p2);
                associatedLine = new HalfPlane(h2, pe2);
            } else {
                [z1, p1, p2] = this.getProjections(pe1, v);
                subPolygons = this.createSubPolygon(pe2, v, z1, p1, p2);
                associatedLine = new HalfPlane(h1, pe1);
            }

        } else if (h1.isBelow(u) === h1.isBelow(pe1)) {
            [z1, p1, p2] = this.getProjections(pe1, v);
            subPolygons = this.createSubPolygon(pe2, v, z1, p1, p2);
            associatedLine = new HalfPlane(h1, pe1);
        } else if (h2.isBelow(u) === h2.isBelow(pe2)) {
            [z1, p1, p2] = this.getProjections(pe2, v);
            subPolygons = this.createSubPolygon(pe1, v, z1, p1, p2);
            associatedLine = new HalfPlane(h2, pe2);

        } else {
            let [pu, pv] = this.getPerpendicularsPoints(u, v);
            [z1, p1, p2] = this.getProjections(v, pu);
            [z2, p3, p4] = this.getProjections(v, pv);
            subPolygons = [this.createSubPolygon(pe1, v, z1, p1, p2), this.createSubPolygon(pe2, v, z2, p3, p4)];
            const hp1 = new HalfPlane(new StraightLine(u, v), pe2);
            const hp2 = new HalfPlane(new StraightLine(u, v), pe1);
            associatedLine = [hp1, hp2];
        }
         
        return [this.fillSubPolygons(subPolygons), associatedLine];
    }
    
    fillSubPolygons(subPolygons) {
        let i = this.polygon.points.indexOf(subPolygons[0]);
        let j = this.polygon.points.indexOf(subPolygons[1]);
        if (subPolygons.length === 2) {
            return [this.fillSubPolygons(subPolygons[0]), this.fillSubPolygons(subPolygons[1])];
        } else if (subPolygons[0].equals(subPolygons[subPolygons.length - 1])){
            subPolygons.pop();
            if (i > j) {
                subPolygons = subPolygons.reverse();
            }
            return subPolygons;
        }
        let k = this.polygon.points.indexOf(subPolygons[3]);
        if (i > j) {
            k = i;
            i = this.polygon.points.indexOf(subPolygons[3]);
            subPolygons = subPolygons.reverse();
        }
        while (k !== i) {
            k = (k + 1) % this.polygon.points.length;
            subPolygons.push(this.polygon.points[k]);
        }
        if (subPolygons[0] === subPolygons[subPolygons.length - 1]) {
            subPolygons.pop();
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
        Object.values(this.chp).forEach(([subPolygons, associatedLine]) => {
            let line = associatedLine;
            if (associatedLine instanceof Array) {
                line = associatedLine[0];
            }
            p.drawingContext.setLineDash([5, 5]); // Set dashed line style
            line.draw(p);
            p.drawingContext.setLineDash([]); // Reset to solid line
        });
    }
}