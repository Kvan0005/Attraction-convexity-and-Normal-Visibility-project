import {det, getTurn, isLeftTurn, isRightTurn, Point} from "./Point.js";
import {DIRECTION} from "./Const.js";
import {ConvexHull} from "./ConvexHull.js";
import {Deque} from "./Deque.js";
import {getIntersection, isBetween} from "./InverseAttraction/SPM.js";
import { HalfPlane } from "./InverseAttraction/HalfPlane.js";
import { StraightLine } from "./InverseAttraction/StraightLine.js";

export class Polygon {
    constructor(points, closed) {
        if (closed === undefined) {closed = false; }
        points ? this.points = points : this.points = [];
        this.closed = closed;
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

        if (isRightTurn(pMinus, p, pPlus)) {
            this.points.reverse();
        }
    }

    getClockWiseOrder() {
        return new Polygon([...this.points].reverse(), true);
    }


    leftmostPoint() {
        return this.points.reduce(
            (min, current) => (current.x < min.x ? current : min),
            this.points[0]
        );
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

    isCutting2(p1, p2) {
        for (let i = 0; i < this.points.length - 1; i++) {
            let a = this.points[i], b = this.points[i + 1];
            if (a === p1 || a === p2 || b === p1 || b === p2) continue;

            let turn1 = det(p1, p2, a) >= 0;
            let turn2 = det(p1, p2, b) >= 0;
            if (turn1 !== turn2) {
                let turn3 = det(a, b, p2) >= 0;
                let turn4 = det(a, b, p1) >= 0;
                if (turn3 !== turn4) return true;
            }
        }
        return false;
    }

    isReflex(p1, p2, p3) {
        return det(p1, p2, p3) < 0;
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
        let a = this.melkman();
        let b = this.grahamScan();
        console.log(a);
        console.log(b);
        return new ConvexHull(this.melkman());
    }

    grahamScan() {
        let points = [...this.points]
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

    melkman() {
        // create a copy of the points
        let points = [...this.points];
        let n = points.length;
        if (n <= 3) {
            return points;
        }
        let deque = new Deque();
        let v1 = points.shift(), v2 = points.shift(), v3 = points.shift();
        if (isRightTurn(v1, v2, v3)) {
            deque.push(v1);
            deque.push(v2);
        }
        else {
            deque.push(v2);
            deque.push(v1);
        }
        deque.push(v3);
        deque.unshift(v3);
        while (points.length > 0) {
            let v = points.shift();
            while(!(isLeftTurn(v, deque.peekFront(), deque.peekFrontNext()) || isLeftTurn(deque.peekBackPrev(), deque.peekBack(), v))) {
                v = points.shift();
                if (v === undefined) {
                    deque.pop();
                    return deque.deque.reverse();
                }
            }
            while(!isRightTurn(deque.peekBackPrev(), deque.peekBack(), v)) {
                deque.pop();
            }
            deque.push(v);
            while (!isRightTurn(v, deque.peekFront(), deque.peekFrontNext())) {
                deque.shift();
            }
            deque.unshift(v);
        }
        deque.pop();
        return deque.deque.reverse();
    }

    get(index) {
        if (index < 0 || index > this.points.length) {
            console.log("Index Error: {}", index);
            return null;
        }
        return this.points[index];
    }

    rotate() {
        let first = this.points.shift();
        this.points.push(first);
    }

    intersectWith(otherPolygon, startingPoint) {
        let currentPoint = startingPoint;
        let result = [currentPoint];
        let polygonA = this;
        let polygonB = otherPolygon;
        let previous = null;
        let i = 0;

        while (true) {
            let nextPointA = this.nextPoint(currentPoint, polygonA, previous);
            let nextPointB = this.nextPoint(currentPoint, polygonB, previous);
            let secondNextA = this.nextPoint(nextPointA, polygonA, previous);
            let secondNextB = this.nextPoint(nextPointB, polygonB, previous)
    
            // Si les prochains sommets sont les mêmes, continuer
            if (nextPointA === nextPointB) {
                previous = currentPoint
                currentPoint = nextPointA;
                result.push(currentPoint);
            } else {

                let closestPoint = this.nextInPoint(currentPoint, [nextPointA, nextPointB], [secondNextA, secondNextB], previous, [polygonA, polygonB]);
    
                if (closestPoint === nextPointA) {
                    previous = currentPoint;
                    currentPoint = nextPointA;
                } else {
                    previous = currentPoint;
                    currentPoint = nextPointB;
                    [polygonA, polygonB] = [polygonB, polygonA];
                }
                result.push(currentPoint);
                    
            }
    
            // Si nous revenons au point de départ, terminer
            if (currentPoint === startingPoint || i === 20) break;
            i++;
        }
    
        return new Polygon(result, true);
    }

    // Trouver le prochain sommet dans le polygone
    nextPoint(currentPoint, polygon, previous = null) {
        let currentIndex = polygon.points.findIndex(point => point.equals(currentPoint));
        if (currentIndex === -1) {
            for (let index = 0; index < polygon.points.length; index++) {
                const point = polygon.points[index];
                const point2 = polygon.points[(index + 1) % polygon.points.length];
                if (previous && point2.equals(previous)) {
                    continue;
                }
                const sl = new StraightLine(point, point2);
                if (sl.isOn(currentPoint)) {
                    return point2;
                }
            }
        }
        return polygon.points[(currentIndex + 1) % polygon.points.length];
    }

    previousPoints(currentPoint, polygon, previous =null) {
        let currentIndex = polygon.points.findIndex(point => point.equals(currentPoint));
        if (currentIndex === -1) {
            for (let index = 0; index < polygon.points.length; index++) {
                const point = polygon.points[index];
                const point2 = polygon.points[(index - 1) % polygon.points.length];
                if (previous && point2.equals(previous)) {
                    continue;
                }
                const sl = new StraightLine(point, point2);
                if (sl.isOn(currentPoint)) {
                    return point2;
                }
            }
        }
        if (currentIndex === 0) {
            return polygon.points[polygon.points.length - 1];
        }
        return polygon.points[currentIndex - 1];
    }
    
    // Trouver le point le plus proche parmi un ensemble
    nextInPoint(referencePoint, nextPoints, secondNexts, previousPoint, polygons) {
        if (previousPoint === null) {
            if (isLeftTurn(this.previousPoints(referencePoint, polygons[0]), referencePoint, nextPoints[0])) {
                return nextPoints[0];
            } else if (isLeftTurn(this.previousPoints(referencePoint, polygons[1]), referencePoint, nextPoints[1])) {
                return nextPoints[1];
            }
        }
        const lft1 = isLeftTurn(previousPoint, referencePoint, nextPoints[0]);
        const lft2 = isLeftTurn(previousPoint, referencePoint, nextPoints[1]);
        const left3 = isLeftTurn(referencePoint, nextPoints[0], secondNexts[0]);
        const left4 = isLeftTurn(referencePoint, nextPoints[1], secondNexts[1]);
        const lft5 = isLeftTurn(secondNexts[1], nextPoints[0], secondNexts[0]);
        if (lft1 && lft2) {
            if (left3 && left4) {
                if (lft5) {
                    return nextPoints[1];
                } else {
                    return nextPoints[0];
                }
            }
            if (left3) {
                return nextPoints[0];
            } else if (left4) {
                return nextPoints[1];
            }
        } else  if (lft1) {
            return nextPoints[0];
        } else if (lft2) {
            return nextPoints[1];
        }
            
        return nextPoints[0];
    }
}