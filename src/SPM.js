import { Point, isRightTurn } from "./Point.js";

export class SPM {
    constructor(polygon, spt) {
        this.polygon = polygon;
        this.spt = spt;
        this.projections = this.computeProjections();
        this.regions = this.computeRegions();
    }

    computeRegions() {
        const regions = {};
        const points = this.insertProjections();

        let i = 0;
        regions[i] = this.getNeighbors(points[0], points);

        Object.keys(this.projections).forEach(key => {
            i++;
            const [, v] = JSON.parse(key);
            const intersection = this.projections[key][0];
            regions[i] = this.getNeighbors(new Point(v.x, v.y), points, intersection);
        });
        return regions;
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
                if (intersection) {
                    const key = JSON.stringify([u, v]);
                    if (!(key in projections) || isBetween(v, projections[key], intersection)) {
                        projections[key] = [intersection, p1, p2];
                    }
                    
                }
            });
        });
        return projections;
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
        
        Object.values(this.regions).forEach((region, index) => {
            const color = colors[index % colors.length];
            p.fill(...color);
            p.beginShape();
            region.forEach(point => {
                p.vertex(point.x, -point.y);
            });
            p.endShape(p.CLOSE);
        });
    }
}

export function isBetween(p1, p2, p) {
    return (p.x >= Math.min(p1.x, p2.x) && p.x <= Math.max(p1.x, p2.x) &&
    p.y >= Math.min(p1.y, p2.y) && p.y <= Math.max(p1.y, p2.y));
}

export function getIntersection(p1, p2, p3, p4) {
    let a1 = (p2.y - p1.y) / (p2.x - p1.x);
    let a2 = (p4.y - p3.y) / (p4.x - p3.x);
    let b1 = p1.y - a1 * p1.x;
    let b2 = p3.y - a2 * p3.x;

    if (a1 === a2) return null;

    let x = (b2 - b1) / (a1 - a2);
    let y = a1 * x + b1;
    let p = new Point(x, y);

    if (p.equals(p1) || p.equals(p2) || p.equals(p3) || p.equals(p4)) return null;

    if (isBetween(p3, p4, p) && isBetween(p1, p, p2)) {
        return p;
    }
    return null;
}