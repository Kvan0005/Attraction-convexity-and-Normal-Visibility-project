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
        //this.limitDrawing();
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
        this.p.draw(p);

        this.polygon.draw(p);
        //this.spt.draw(p);
        //this.spm.draw(p);
        //this.chp.draw(p);
        //this.free.draw(p);

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
        
        Object.values(this.iar).forEach((region, index) => {
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