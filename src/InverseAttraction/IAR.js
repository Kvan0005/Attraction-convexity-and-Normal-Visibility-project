import { Point } from "../../src/Point.js";
import { Polygon } from "../../src/Polygon.js";
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
        this.free = new Free(this.chp);
        this.limitDrawing();
        this.iar = this.computeIAR();
    }

    computeIAR() {
        const iar = {};
        iar[JSON.stringify({x: this.p.x, y: this.p.y})] = this.spm.regions[JSON.stringify({x: this.p.x, y: this.p.y})];
        let path = [this.p];
        this.spt.tree.forEach(([u, v]) => {
            const spmRegion = this.spm.regions[JSON.stringify({x: v.x, y: v.y})];
            if (spmRegion === undefined) {
                return;
            }

            path = path.slice(0, path.indexOf(u) + 1);
            path.push(v);
            let hi = this.free.freeRegions[JSON.stringify({x: v.x, y: v.y})];
            if (Array.isArray(hi)) {
                hi = this.keepRegion(hi, v, spmRegion.nextPoint(v, spmRegion));
            }
            for (let i = 2; i < path.length; i++) {
                let freeRegion = this.free.freeRegions[JSON.stringify({x: path[i].x, y: path[i].y})];
                if (Array.isArray(freeRegion)) {
                    freeRegion = this.keepRegion(freeRegion, path[i]);
                }
                hi = hi.intersectWith(freeRegion, spmRegion.nextPoint(v, spmRegion));
            }
            iar[JSON.stringify({x: v.x, y: v.y})] = spmRegion.intersectWith(hi, v);

        });
        return iar;
    }

    keepRegion(hi, v, nextSpm) {
        if (hi[0].nextPoint(v, hi[0]).equals(nextSpm)) {
            return hi[0];
        }
        return hi[1];
    }

    limitDrawing() {
        this.spt.switchLimitDrawing();
        this.spm.switchLimitDrawing();
        this.free.switchLimitDrawing();
        this.spt.setDrawLine(0);
        this.spm.setDrawRegion(0);
        this.free.setDrawRegion(2);
    }

    draw(p) {
        // draw attracted point
        this.p.draw(p);

        this.polygon.draw(p);
        //this.spt.draw(p);
        //this.spm.draw(p);
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