import {det, getTurn} from "./Point.js";
import {DIRECTION} from "./Const.js";
import {ConvexHull} from "./ConvexHull.js";

export class Polygon {
    constructor(points) {
        points ? this.points = points : this.points = [];
        this.closed = false;
    }

    addPoint(point) {
      if (this.closed) return;
      if (this.length() < 3) {
        this.points.push(point);
      } else if (this.isCutting(point)) {
        //textToDisplay = "Do not cut an edge";
      } else if (!this.closed) {
        this.points.push(point);
      }
    }

    length() {
      return this.points.length;
    }

    reset() {
      this.points = [];
      this.closed = false;
      //textToDisplay = "Construct a Polygon";
    }

    compute() {
      if (!this.closed && !this.isCutting()) {
        this.closed = true;
        this.toCounterClockwiseOrder();
        //textToDisplay = "Poof !";
      }
      //textToDisplay = "Close without cutting an edge";
    }

    toCounterClockwiseOrder() {
      let p = this.downmostPoint();
      let pIndex = this.points.indexOf(p);
      let pMinus = pIndex - 1 >= 0 ? this.points[pIndex - 1] : this.points[this.length() - 1];
      let pPlus = this.points[(pIndex + 1) % this.length()];

      if (det(pMinus, p, pPlus) < 0) {
        this.points.reverse();
      }
    }

    downmostPoint() {
      return this.points.reduce(
        (min, current) => (current.y < min.y ? current : min),
        this.points[0]
      );
    }

    isCutting(point) {
      let rm = 0;
      if (point === undefined) {
        point = this.points[0];
        rm = 1;
      }
      let p = this.points[this.points.length - 1];
      for (let i = rm; i < this.points.length - 2; i++) {
        let a = this.points[i], b = this.points[i + 1];

        let turn1 = det(point, p, a) >= 0;
        let turn2 = det(point, p, b) >= 0;
        if (turn1 !== turn2) {
          let turn3 = det(a, b, point) >= 0;
          let turn4 = det(a, b, p) >= 0;
          if (turn3 !== turn4) return true;
        }
      }
      return false;
    }

    draw(p) {
      let ctx = p.drawingContext;
      let n = this.points.length - 1;
      this.points.forEach((point) => point.draw(p));
      for (let i = 0; i < this.points.length - 1; i++) {
        p.line(this.points[i].x, -this.points[i].y, this.points[i + 1].x, -this.points[i + 1].y);
      }
      if (!this.closed) ctx.setLineDash([5, 10]);
      if (this.points.length >= 3) {
        p.line(this.points[0].x, -this.points[0].y, this.points[n].x, -this.points[n].y);
      }
      ctx.setLineDash([]);
      p.fill("white");
      p.stroke("white");
    }

    getConvexHull() {
        return new ConvexHull(this.grahamScan())
    }

    grahamScan() {
        let points = [... this.points]
        let n = points.length;
        if (n < 3) {
            return points;
        }
        points.sort((a, b) => {
            return a.x - b.x;
        });
        let firstPoint = points[0];
        points.shift(); // to

        points.sort((a, b) => {
            let turn = getTurn(a, firstPoint, b); // this will return which point is higher the other based on the first point
            return turn === DIRECTION.RIGHT ? -1 : 1;
            // this only works for when the first point is the lowest point on the x-axis
        });
        let hull = [];
        hull.push(firstPoint);
        hull.push(points[0]);
        hull.push(points[1]);
        for (let i = 1; i < n - 1; i++) {
            while (getTurn(hull[hull.length - 2], hull[hull.length - 1], points[i]) !== DIRECTION.LEFT) {
                hull.pop();
            }
            hull.push(points[i]);
        }
        return hull;
    }
  }