import { Point, isLeftTurn } from "../geometry/Point.js";
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
        if (this.h.p1.equals(p1) || this.h.p1.equals(p2)) {
            return this.h.p1;
        } else if (this.h.p2.equals(p1) || this.h.p2.equals(p2)) {
            return this.h.p2;
        }
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

        this.spt.tree.forEach(([u, v]) => {
            let i = this.polygon.points.indexOf(v);
            let pe1 = this.polygon.points[(i - 1) % this.polygon.points.length];
            let pe2 = this.polygon.points[(i + 1) % this.polygon.points.length];
            let h1 = perpendicularFromTwoPoints(pe1, v, v);
            let h2 = perpendicularFromTwoPoints(pe2, v, v);
            straightLines.push(h1, h2);

            const key = JSON.stringify({x: v.x, y: v.y});
            const subPolygon = this.determineSubPolygon(u, v, pe1, pe2, h1, h2);
            if (subPolygon === undefined) {
                return;
            }
            this.chp[key] = subPolygon; 
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
                if (z1 === undefined) {
                    return;
                }
                subPolygons = this.createSubPolygon(pe1, v, z1, p1, p2);
                associatedLine = new HalfPlane(h2, pe2);
            } else {
                [z1, p1, p2] = this.getProjections(pe1, v);
                if (z1 === undefined) {
                    return;
                }
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
            if (!isLeftTurn(pe1, v, pu)) {
                [pu, pv] = [pv, pu];
            }
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

        Object.values(this.chp).forEach(([subPolygons, associatedLine], index) => {
                if (subPolygons.length === 2) {
                    for (const subPolygon of subPolygons) {
                        const color = colors[index % colors.length];
                        p.fill(...color);
                        p.beginShape();
                        for (const point of subPolygon) {
                            p.vertex(point.x, -point.y);
                        }
                        p.endShape(p.CLOSE);
                    }
                } else {
                    const color = colors[index % colors.length];
                    p.fill(...color);
                    p.beginShape();
                    for (const point of subPolygons) {
                        p.vertex(point.x, -point.y);
                    }
                    p.endShape(p.CLOSE);
                }
            });
    }

    drawH1(p, i = 1) {
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

        Object.values(this.chp).forEach(([subPolygons, associatedLine], index) => {
            if (i !== index) {
                return;
                }
            if (subPolygons.length === 2) {
                let j = 0;
                for (const subPolygon of subPolygons) {
                    const color = colors[j++];
                    p.fill(...color);
                    p.beginShape();
                    for (const point of subPolygon) {
                    p.vertex(point.x, -point.y);
                    }
                    p.endShape(p.CLOSE);
                }
                associatedLine[0].draw(p);
                const [u, v] = this.spt.tree[1];
                p.fill("red");
                p.stroke("red");
                u.draw(p);
                v.draw(p);
                p.line(u.x, -u.y, v.x, -v.y);

                p.stroke("black");
                p.fill("black");
                this.spt.tree[0][0].draw(p);

                this.straightLines[2 * index].draw(p, "blue", true);
                this.straightLines[2 * index + 1].draw(p, "blue", true);

                p.textSize(10);
                p.stroke("black");
                p.fill("black");
                p.text(`v`, v.x + 5, -v.y - 10);
                p.text(`u`, u.x - 5, -u.y - 5);
                p.textSize(9);
                p.text(`H1`, this.straightLines[2 * index].p1.x + 5, -this.straightLines[2 * index].p1.y - 15);
                p.text(`H2`, this.straightLines[2 * index + 1].p2.x + 80, -this.straightLines[2 * index + 1].p2.y + 40);
                p.text(`e1`, -50, -40);
                p.text(`e2`, 0, -5);
            } else {
                const color = colors[index % colors.length];
                p.fill(...color);
                p.beginShape();
                for (const point of subPolygons) {
                    p.vertex(point.x, -point.y);
                }
                p.endShape(p.CLOSE);
                associatedLine.draw(p);
                const [u, v] = this.spt.tree[0];
                p.fill("red");
                p.stroke("red");
                p.line(u.x, -u.y, v.x, -v.y);
                
                u.draw(p);
                v.draw(p);
                
                this.straightLines[2 * index].draw(p, "blue", true);
                this.straightLines[2 * index + 1].draw(p, "blue", true);

                p.textSize(10);
                p.stroke("black");
                p.fill("black");
                p.text(`v`, v.x + 5, -v.y - 5);
                p.text(`u`, u.x + 5, -u.y - 5);
                p.textSize(9);
                p.text(`H1`, this.straightLines[2 * index].p1.x + 5, -this.straightLines[2 * index].p1.y - 15);
                p.text(`H2`, this.straightLines[2 * index + 1].p2.x + 5, -this.straightLines[2 * index + 1].p2.y + 150);
                p.text(`e1`, 120, -25);
                p.text(`e2`, 135, -95);
            }
        });
    }


}