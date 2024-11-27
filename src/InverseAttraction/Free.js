import { Polygon } from "../geometry/Polygon.js";

export class Free {
    constructor(constrainingHalfPlane, polygon) {
        this.polygon = polygon;
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

                if (domain1.length === 0 && domain2.length === 0) {
                    return;
                } else if (domain1.length === 0) {
                    freeRegions[key] = new Polygon(domain2, true);
                } else if (domain2.length === 0) {
                    freeRegions[key] = new Polygon(domain1, true);
                } else {
                    freeRegions[key] = [new Polygon(domain1, true), new Polygon(domain2, true)];
                }

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
        let intersectionAndFollowingPoints = [];
        const domain = [];

        if (intersections.length < 2 && (!associatedLine.isIn(subPolygon[0]) || !associatedLine.isIn(subPolygon[1]))) {
            return subPolygon;
        } else if (intersections.length < 2) {
            return [];
        }

        for (const element of intersections) {
            const [intersection, p1, p2] = element;
            if (!intersection.equals(p1) && !associatedLine.isIn(p1)) {
                intersectionAndFollowingPoints.push([intersection, p1, -1]);
            } else {
                intersectionAndFollowingPoints.push([intersection, p2, 1]);
            }
        }

        let firstInsert = true;
        subPolygon.push(subPolygon[0]);
        for (const element of subPolygon) {
            if (!associatedLine.isIn(element) || associatedLine.isOn(element)) {
                let j = 0;
                let cond = true;
                while (j >= 0 && intersectionAndFollowingPoints.length > 0) {
                    j = intersectionAndFollowingPoints.findIndex(tuple => tuple[1].equals(element));
                    if (j >= 0) {
                        cond = false;
                        let inter = intersectionAndFollowingPoints[j];
                        intersectionAndFollowingPoints.splice(j, 1);
                        if (inter[2] === 1) {
                            domain.push(inter[0]);
                            if (!inter[0].equals(element)) {
                                domain.push(element);
                            }
                        } else {
                            domain.push(element);
                            if (!element.equals(inter[0])) {
                                domain.push(inter[0]);
                            }
                        }
                    }
                    if (firstInsert) {
                        firstInsert = false;
                        break;
                    }
                }
                if (cond) {
                    if (domain.length === 0 || !domain.includes(element)) {
                        domain.push(element);
                    }
                }
            }
        }
        this.removeDuplicates(domain);
        return domain; 
    }

    removeDuplicates(domain) {
        for (let i = 0; i < domain.length; i++) {
            if (domain[i].equals(domain[(i + 1) % domain.length])) {
                domain.splice(i, 1);
                i--;
            }
        }
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
            p.fill(...color);
            let region = this.freeRegions[Object.keys(this.freeRegions)[this.drawRegion]];
            if (region.length === 2) {
                for (const subPolygon of region) {
                    p.beginShape();
                    for (const point of subPolygon.points) {
                        p.vertex(point.x, -point.y);
                    }
                    p.endShape(p.CLOSE);
                }
            } else {
                p.beginShape();
                for (const point of region.points) {
                    p.vertex(point.x, -point.y);
                }
                p.endShape(p.CLOSE);
            }

        } else {
            Object.values(this.freeRegions).forEach((region, index) => {
                const color = colors[index % colors.length];
                p.fill(...color);
                
                if (region.length === 2) {
                    for (const subPolygon of region) {
                        p.beginShape();
                        for (const point of subPolygon.points) {
                            p.vertex(point.x, -point.y);
                        }
                        p.endShape(p.CLOSE);
                    }
                } else {
                    p.beginShape();
                    for (const point of region.points) {
                        p.vertex(point.x, -point.y);
                    }
                    p.endShape(p.CLOSE);
                }
            });
        }
        
    }

    drawFreei(p, i = 0) {
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

        let region = this.freeRegions[Object.keys(this.freeRegions)[i]];
        if (region.length === 2) {
            for (const subPolygon of region) {
                i++;
                const color = colors[i-2];
                p.fill(...color);
                p.beginShape();
                for (const point of subPolygon.points) {
                    p.vertex(point.x, -point.y);
                }
                p.endShape(p.CLOSE);
            }
        } else {
            const color = colors[i % colors.length];
            p.fill(...color);
            p.beginShape();
            for (const point of region.points) {
                p.vertex(point.x, -point.y);
            }
            p.endShape(p.CLOSE);
        }
    }
}