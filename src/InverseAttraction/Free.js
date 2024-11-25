export class Free {
    constructor(constrainingHalfPlane) {
        this.subPolygons = [];
        this.associatedLines = [];
        this.print;

        Object.values(constrainingHalfPlane.chp).forEach(chp => {
            const subPolygon = chp[0];
            const associatedLines = chp[1];

            if (subPolygon.length < 3) {
                this.subPolygons.push(subPolygon[0]);
                this.associatedLines.push(associatedLines[0]);
                this.subPolygons.push(subPolygon[1]);
                this.associatedLines.push(associatedLines[1]);
            } else {
                this.subPolygons.push(subPolygon);
                this.associatedLines.push(associatedLines);
            }
        });
        this.freeRegions = this.computeFreeRegions();
    }

    computeFreeRegions() {
        const freeRegions = [];

        for (let i = 0; i < this.subPolygons.length; i++) {
            if (i !== 7) {
                continue;
            }
            const subPolygon = this.subPolygons[i];
            const associatedLine = this.associatedLines[i];
            const domain = this.computeDomain(subPolygon, associatedLine);
            freeRegions.push(domain);
            this.print = associatedLine;
        }
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
            if (intersection === p1 || !associatedLine.isIn(p1)) {
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
                    domain.push(element);
                } else if (lastIntersection) {
                    let tmp = intersectionAndFollowingPoints[j]
                    domain.push(tmp);
                    if (tmp !== element) {
                        domain.push(element);
                    }
                    lastIntersection = false;
                } else {
                    let tmp = element;
                    domain.push(tmp);
                    if (tmp !== intersectionAndFollowingPoints[j]) {
                        domain.push(intersectionAndFollowingPoints[j]);
                    }
                    lastIntersection = true;
                }
            }
        }
        console.log(domain);
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
        
        Object.values(this.freeRegions).forEach((region, index) => {
            const color = colors[index % colors.length];
            p.fill(...color);
            p.beginShape();
            for (const point of region) {
                p.vertex(point.x, -point.y);
            }
            p.endShape(p.CLOSE);
        });
        this.print.draw(p);
    }
}