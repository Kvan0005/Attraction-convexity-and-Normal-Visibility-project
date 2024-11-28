import { SPT } from "../../src/InverseAttraction/SPT.js";
import { SPM } from "../../src/InverseAttraction/SPM.js";
import { ConstrainingHalfPlanes } from "../../src/InverseAttraction/HalfPlane.js";
import { Free } from "../../src/InverseAttraction/Free.js";

export class IAR {
    constructor(polygon, point) {
        this.polygon = polygon;
        this.p = point;
        this.spt = new SPT(this.polygon, this.p);
        this.spm = new SPM(this.polygon, this.spt, this.p);
        this.chp = new ConstrainingHalfPlanes(this.polygon, this.spt);
        this.free = new Free(this.chp, this.polygon);
        this.iar = this.computeIAR();
    }

    computeIAR() {
        const iar = {};
        iar[JSON.stringify({x: this.p.x, y: this.p.y})] = this.spm.regions[JSON.stringify({x: this.p.x, y: this.p.y})];
        let path = [this.p];

        this.spt.tree.forEach(([, v]) => {
            let spmRegion = this.spm.regions[JSON.stringify({x: v.x, y: v.y})];
            path.push(v);
            if (spmRegion === undefined) {
                return;
            }

            let hi = this.free.freeRegions[JSON.stringify({x: v.x, y: v.y})];
            hi = this.keepRegion(hi, spmRegion);
            if (hi === null) {
                return;
            }

            for (let i = 1; i < path.length - 1; i++) {
                let freeRegion = this.free.freeRegions[JSON.stringify({x: path[i].x, y: path[i].y})];
                freeRegion = this.keepRegion(freeRegion, spmRegion);
  
                if (freeRegion === null) {
                    continue;
                }
                hi = hi.intersectWith(freeRegion);
            }
            let res = spmRegion.intersectWith(hi, v);
            if (res === null) {
                return;
            }
            iar[JSON.stringify({x: v.x, y: v.y})] = res;
        });
        return iar;
    }

    keepRegion(hi, spm) {
        if (!Array.isArray(hi)) {
            hi = [hi];
        }

        for (let region of hi) {
            if (this.hasIntersection(region, spm)) {
                return region;
            }
        }

        return null;
    }

    hasIntersection(region, spm) {
        let i = 0;
        for (let point of region.points) {
            if (this.isPointInPolygon(point, spm.points)) {
                i++;
            }
        }
        for (let point of spm.points) {
            if (this.isPointInPolygon(point, region.points)) {
                i++;
            }
        }
        return i > 1;
    }

    isPointInPolygon(point, polygonPoints) {
        let inside = false;
        for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
            const xi = polygonPoints[i].x, yi = polygonPoints[i].y;
            const xj = polygonPoints[j].x, yj = polygonPoints[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y)) &&
                (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    limitDrawing() {
        this.spt.switchLimitDrawing();
        this.spm.switchLimitDrawing();
        this.free.switchLimitDrawing();
        this.spt.setDrawLine(0);
        this.spm.setDrawRegion(0);
        this.free.setDrawRegion(0);
    }

    draw(p) {
        // draw attracted point
        this.drawPoly(p);
        
        Object.values(this.iar).forEach((region, index) => {
            p.fill(100, 100, 250, 50);
            p.beginShape();
            for (const point of region.points) {
                p.vertex(point.x, -point.y);
            }
            p.endShape(p.CLOSE);
        });
    }

    drawPoly(p) {
        p.fill("red");
        p.stroke("red");
        this.p.draw(p);

        p.stroke("black");
        p.fill("black");
        p.strokeWeight(1);
        this.polygon.draw(p);

        p.stroke("blue");
        p.strokeWeight(0);
    }

    drawSPT(p) {
        this.spt.draw(p);
    }

    drawSPM(p) {
        this.spm.draw(p);
    }

    drawCHP(p) {
        this.chp.draw(p);
    }

    drawFree(p) {
        this.free.draw(p);
    }

    drawRi(p) {
        
        this.drawPoly(p);
        
        const region = this.spm.regions[Object.keys(this.spm.regions)[1]];
        if (region) {
            p.fill( 100, 100, 250, 50);
            p.beginShape();
            for (const point of region.points) {
                p.vertex(point.x, -point.y);
                this.drawDashedLines(p, region.points[0], point);
            }
            p.endShape(p.CLOSE);
        }
        
        p.fill("turquoise");
        this.polygon.points[5].draw(p);

        let v = region.points[0];
        let u = region.points[5];
        let z = region.points[1];

        p.textFont("Georgia", 15);
        p.stroke("black");
        p.noStroke();
        p.fill("black");
        p.text(`p`, this.p.x + 5, -this.p.y - 5);
        p.text(`v`, v.x + 5, -v.y - 5);
        p.text(`u`, u.x + 5, -u.y - 5);
        p.text(`z`, z.x + 5, -z.y - 5);
        p.text(`w`, (v.x + z.x) / 2 + 5, -(v.y + z.y) / 2 - 5);
        p.textFont("Georgia", 6);
        p.text(`i`, v.x + 14, -v.y - 5);
        p.text(`i`, z.x + 14, -z.y - 5);
        p.text(`i`, (v.x + z.x) / 2 + 15, -(v.y + z.y) / 2 - 5);

    }

    drawDashedLines(p, start, end) {
        p.stroke("green");
        p.strokeWeight(1);
        p.drawingContext.setLineDash([5, 5]);

        p.line(start.x, -start.y, end.x, -end.y);
        p.drawingContext.setLineDash([]);
    }

    drawH1(p) {
        this.drawPoly(p);
        this.chp.drawH1(p)
    }

    drawH2(p) {
        this.drawPoly(p);
        this.chp.drawH1(p, 0)
    }

    drawFreei(p) {
        this.drawPoly(p);
        this.free.drawFreei(p, 1);
    }

    drawFreei2(p) {
        this.drawPoly(p);
        this.free.drawFreei(p);
    }
}