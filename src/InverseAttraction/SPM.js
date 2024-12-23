import { Point, isRightTurn, isLeftTurn } from "../geometry/Point.js";
import { Polygon } from "../geometry/Polygon.js";

export class SPM {
    constructor(polygon, spt, point) {
        this.polygon = polygon;
        this.p = point;
        this.spt = spt;
        this.projections = this.computeProjections();
        this.regions = this.computeRegions();
        this.limitDraw = false;
        this.drawRegion = 0;
    }

    computeRegions() {
        const regions = {};
        const points = this.insertProjections();

        let intersection;
        let x_point = this.getSeenPointfromSource();
        // const key = JSON.stringify([this.p, x_point])
        // if (key in this.projections) {
        //     intersection = this.projections[key][0];
        // }
        regions[JSON.stringify({x: this.p.x, y: this.p.y})] = new Polygon(this.getNeighbors(x_point, points), true);

        Object.keys(this.projections).forEach(key => {
            const [, v] = JSON.parse(key);
            intersection = this.projections[key][0];
            regions[JSON.stringify({x: v.x, y: v.y})] = new Polygon(this.getNeighbors(new Point(v.x, v.y), points, intersection), true);
        });
        return regions;
    }

    getSeenPointfromSource() {
        let findOne = null;
        for (let i = 0; i < this.polygon.length(); i++) {
            const p1 = this.polygon.get(i);
            if (this.polygon.isCutting2(this.p, p1)) {
                findOne = null;
            }
            else if (findOne) {
                return findOne;
            } else {
                findOne = p1;
            }
        }
        return null;
    }

    getNeighbors(u, points, intersection = null) {
        const neighbors = [u];
        let i = (points.findIndex(point => point.equals(u)) + 1) % points.length;
        if (intersection && isRightTurn(intersection, u, points[i])) {
            neighbors.push(intersection);
            i = (points.indexOf(intersection) + 1) % points.length;
        }
        while (neighbors.length === 1 || (!points[i].equals(u) && !neighbors[neighbors.length - 1].equals(u))) {
            const found = Object.keys(this.projections).find(key => { 
                let [, v] = JSON.parse(key);
                v = new Point(v.x, v.y);
                const intersection = this.projections[key][0];
                return intersection.equals(points[i]) || v.equals(points[i]);
            });
            if (found) {
                let [, v] = JSON.parse(found);
                v = new Point(v.x, v.y);
                const intersection = this.projections[found][0];
                if (intersection.equals(points[i])) {
                    neighbors.push(intersection);
                    neighbors.push(v);
                    i = (points.findIndex(point => point.equals(v)) + 1) % points.length;
                } else if (v.equals(points[i])) {
                    neighbors.push(v);
                    neighbors.push(intersection);
                    i = (points.indexOf(intersection) + 1) % points.length;
                }
            } else {
                neighbors.push(points[i]);
                i = (i + 1) % points.length;
            }
        }
        if (neighbors[neighbors.length - 1].equals(u)) {
            neighbors.pop();
        }
        return neighbors;
    }

    insertProjections() {
        const points = [...this.polygon.points];
        Object.values(this.projections).forEach(([projection, p1,]) => {
            const i = points.indexOf(p1);
            points.splice(i + 1, 0, projection);
        });
        return points;
    }

    computeProjections() {
        const projections = {};
        const edges = this.polygon.points.map((point, i) => [point, this.polygon.points[(i + 1) % this.polygon.length()]]);
        
        this.spt.tree.forEach(([u, v]) => {
            edges.forEach(([p1, p2]) => {
                if ((u.equals(p1) || v.equals(p2)) || (u.equals(p2) || v.equals(p1))) return;
                const intersection = getIntersection(u, v, p1, p2);
                let w = (this.polygon.points.findIndex(point => point.equals(v)) - 1 + this.polygon.points.length) % this.polygon.points.length;
                let x = (w + 2) % this.polygon.points.length;
                if (intersection && (isLeftTurn(this.polygon.points[w], v, intersection) || isLeftTurn(v, this.polygon.points[x], intersection))) {
                    const key = JSON.stringify([u, v]);
                    if (!(key in projections) || isBetween(v, projections[key], intersection)) {
                        projections[key] = [intersection, p1, p2];
                    }
                }
            });
        });
        return projections;
    }

    switchLimitDrawing() {
        this.limitDraw = !this.limitDraw;
    }

    setDrawRegion(regionNb) {
        this.drawRegion = regionNb;
    }
    
    draw(p) {
        const colors = [
            [100, 100, 250, 50],
            [250, 100, 100, 50],
            [100, 250, 100, 50],
            [250, 250, 100, 50],
            [100, 250, 250, 50],
            [250, 100, 250, 50]
        ];
        
        p.stroke("blue");
        p.strokeWeight(1);

        if (this.limitDraw) {
            const region = this.regions[Object.keys(this.regions)[this.drawRegion]];
            p.fill(colors[this.drawRegion % colors.length]);
            p.beginShape();
            for (const point of region.points) {
                p.vertex(point.x, -point.y);
            }
            p.endShape(p.CLOSE);

        } else {
            Object.values(this.regions).forEach((region, index) => {
                const color = colors[index % colors.length];
                p.fill(...color);
                p.beginShape();
                for (const point of region.points) {
                    p.vertex(point.x, -point.y);
                }
                p.endShape(p.CLOSE);
            });
        }
    }
}

export function isBetween(p1, p2, p) {
    return (p.x >= Math.min(p1.x, p2.x) && p.x <= Math.max(p1.x, p2.x) &&
    p.y >= Math.min(p1.y, p2.y) && p.y <= Math.max(p1.y, p2.y));
}

export function getIntersection(p1, p2, p3, p4) {
    let a1, a2, b1, b2;

    if (p1.x === p2.x) {
        a1 = Infinity;
        b1 = p1.x;
    } else {
        a1 = (p2.y - p1.y) / (p2.x - p1.x);
        b1 = p1.y - a1 * p1.x;
    }

    if (p3.x === p4.x) {
        a2 = Infinity;
        b2 = p3.x;
    } else {
        a2 = (p4.y - p3.y) / (p4.x - p3.x);
        b2 = p3.y - a2 * p3.x;
    }

    if (a1 === a2) return null;

    let x, y;
    if (a1 === Infinity) {
        x = b1;
        y = a2 * x + b2;
    } else if (a2 === Infinity) {
        x = b2;
        y = a1 * x + b1;
    } else {
        x = (b2 - b1) / (a1 - a2);
        y = a1 * x + b1;
    }

    let p = new Point(x, y);

    if (p.equals(p1) || p.equals(p2) || p.equals(p3) || p.equals(p4)) return null;

    if (isBetween(p3, p4, p) && isBetween(p1, p, p2)) {
        return p;
    }
    return null;
}