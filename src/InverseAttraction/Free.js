import { Polygon } from "../Polygon.js";

export class Free {
    constructor(constrainingHalfPlane) {
        this.subPolygons = [];
        this.associatedLines = [];
        this.freeRegions = this.computeFreeRegions(constrainingHalfPlane);
        this.limitDraw = false;
        this.drawRegion = 0;
    }

    computeFreeRegions(constrainingHalfPlane) {
        const freeRegions = {};

        Object.keys(constrainingHalfPlane.chp).forEach(key => {
            const chp = constrainingHalfPlane.chp[key];
            const subPolygon = chp[0];
            const associatedLines = chp[1];

            if (subPolygon.length < 3) {
                this.subPolygons.push(subPolygon[0]);
                this.associatedLines.push(associatedLines[0]);
                this.subPolygons.push(subPolygon[1]);
                this.associatedLines.push(associatedLines[1]);
                const domain1 = this.computeDomain(subPolygon[0], associatedLines[0]);
                const domain2 = this.computeDomain(subPolygon[1], associatedLines[1]);
                freeRegions[key] = [new Polygon(domain1, true), new Polygon(domain2, true)];
            } else {
                this.subPolygons.push(subPolygon);
                this.associatedLines.push(associatedLines);
                const domain = this.computeDomain(subPolygon, associatedLines);
                freeRegions[key] = new Polygon(domain, true);
            }
        });

        return freeRegions;
    }

    computeDomain(subPolygon, associatedLine) {
        const intersections = this.getIntersections(subPolygon, associatedLine);
        const intersectionAndFollowingPoints = [];
        const domain = []

        if (intersections.length < 2 && (!associatedLine.isIn(subPolygon[0]) || !associatedLine.isIn(subPolygon[1]))) {
            return subPolygon;
        } else if (intersections.length < 2) {
            return [];
        }
        for (const element of intersections) {
            const [intersection, p1, p2] = element;
            intersectionAndFollowingPoints.push(intersection); 
            if (intersection.equals(p1) || !associatedLine.isIn(p1)) {
                intersectionAndFollowingPoints.push(p1);
            } else {
                intersectionAndFollowingPoints.push(p2);
            }
        }

        let lastIntersection = false;
        for (const element of subPolygon) {
            if (!associatedLine.isIn(element) || associatedLine.isOn(element)) {
                let j = intersectionAndFollowingPoints.findIndex(point => point.equals(element)) - 1;
                if (j < 0) {
                    if (domain.length === 0 || !domain[domain.length - 1].equals(element)) {
                        domain.push(element);
                    }
                } else if (lastIntersection) {
                    let tmp = intersectionAndFollowingPoints[j]
                    domain.push(tmp);
                    if (!tmp.equals(element)) {
                        domain.push(element);
                    }
                    lastIntersection = false;
                } else {
                    let tmp = element;
                    domain.push(tmp);
                    if (!tmp.equals(intersectionAndFollowingPoints[j])) {
                        domain.push(intersectionAndFollowingPoints[j]);
                    }
                    lastIntersection = true;
                }
            }
        }
        return domain;
    }

    getIntersections(subPolygon, halfPlane) {
        const intersections = [];
        for (let i = 0; i < subPolygon.length; i++) {
            const p1 = subPolygon[i];
            const p2 = subPolygon[(i + 1) % subPolygon.length];
            const intersection = halfPlane.getIntersection(p1, p2);
            if (intersection) {
                intersections.push([intersection, p1, p2]);
            }
        }
        return intersections;
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
            const color = colors[this.drawRegion % colors.length];
            let r = this.freeRegions[Object.keys(this.freeRegions)[this.drawRegion]];
            if (Array.isArray(r)) {
                r = r[0];
            }
            p.fill(...color);
            p.beginShape();
            for (const point of r.points) {
                p.vertex(point.x, -point.y);
            }
            p.endShape(p.CLOSE);

        } else {
            Object.values(this.freeRegions).forEach((region, index) => {
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