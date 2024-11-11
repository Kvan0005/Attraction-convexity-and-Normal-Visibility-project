import { getTurn, det } from "./Point.js";
import { DIRECTION, ISINSIDE} from "./Const.js";
export class Triangle {
    constructor(a, b, c) {
      this.points = [a, b, c];
    }
  
    getPoints() {
      return this.points;
    }
  
    isLeftTurn() {
      return det(this.points[0], this.points[1], this.points[2]) > 0;
    }
  
    contains(point) {
      let orientation;
  
      for (let i = 0; i < 3; i++) {
        let det_ = det(this.points[i % 3], this.points[(i + 1) % 3], point);
  
        let nextOrientation = det_ > 0 ? "LT" : det_ < 0 ? "RT" : "S";
        if (!orientation) {
          orientation = nextOrientation;
        } else if (orientation !== nextOrientation) {
          if (nextOrientation !== "S") {
            return false;
          }
        }
      }
      if (orientation === "S") return false;
      return true;
    }
  
    drawWithoutTop() {
      line(
        this.points[0].x,
        -this.points[0].y,
        this.points[2].x,
        -this.points[2].y
      );
    }
  }
  
export class Polygon {
    constructor() {
      this.points = [];
      this.pointsCopy = [];
      this.closed = false;
      this.triangulation = [];
    }
  
    addPoint(point) {
      if (this.closed) return;
      if (this.length() < 3) {
        this.points.push(point);
      } else if (this.isCutting(point)) {
        textToDisplay = "Do not cut an edge";
      } else if (!this.closed) {
        this.points.push(point);
      }
    }
  
    getPoint(i) {
      return this.points[i];
    }
  
    length() {
      return this.points.length;
    }
  
    reset() {
      this.points = [];
      this.pointsCopy = [];
      this.closed = false;
      this.triangulation = [];
      textToDisplay = "Construct a Polygon";
    }
  
    compute() {
      if (!this.closed && !this.isCutting()) {
        this.closed = true;
        this.toCounterClockwiseOrder();
        textToDisplay = "Poof !";
        return;
      }
      textToDisplay = "Close without cutting an edge";
    }
    
    toCounterClockwiseOrder() {
      let p = this.downmostPoint();
      let pIndex = this.points.indexOf(p);
      let pMinus =
        pIndex - 1 >= 0
          ? this.points[pIndex - 1]
          : this.points[this.length() - 1];
      let pPlus = this.points[(pIndex + 1) % this.length()];
  
      if (det(pMinus, p, pPlus) < 0) {
        this.pointsCopy = [...this.points].reverse();
      } else {
        this.pointsCopy = [...this.points];
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
      for (let i = 0 + rm; i < this.points.length - 2; i++) {
        let a = this.points[i],
          b = this.points[i + 1];
  
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
        p.line(
          this.points[i].x,
          -this.points[i].y,
          this.points[i + 1].x,
          -this.points[i + 1].y
        );
      }
      if (!this.closed) ctx.setLineDash([5, 10]);
      if (this.points.length >= 3) {
        p.line(
          this.points[0].x,
          -this.points[0].y,
          this.points[n].x,
          -this.points[n].y
        );
      }
      ctx.setLineDash([]);
  
      let triangulationColor = [64, 111, 75];
      p.fill(...triangulationColor);
      p.stroke(...triangulationColor);
  
      this.triangulation.forEach((tri) => tri.drawWithoutTop());
  
      p.fill("white");
      p.stroke("white");
    }
  }