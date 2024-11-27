import {det, getTurn, isLeftTurn, isRightTurn} from "./Point.js";
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

    findStartingPoint(otherPolygon) {
        for (let pointA of this.points) {
            for (let pointB of otherPolygon.points) {
                if (pointA.equals(pointB)) {
                    return pointA;
                }
            }
        }
        return null;
    }

    getIntersections(otherPolygon) {
        const intersections = [];
        for (let i = 0; i < this.points.length; i++) {
            const p1 = this.points[i];
            const p2 = this.points[(i + 1) % this.points.length];
            const line1 = new StraightLine(p1, p2);

            for (let j = 0; j < otherPolygon.points.length; j++) {
                const p3 = otherPolygon.points[j];
                const p4 = otherPolygon.points[(j + 1) % otherPolygon.points.length];
                if (line1.isOn(p3) || line1.isOn(p4)) {
                    continue;
                }
                
                const intersection = line1.getIntersection(p3, p4);
                if (intersection && isBetween(p1, p2, intersection) && isBetween(p3, p4, intersection)) {
                    intersections.push(intersection);
                }
            }
        }
        return intersections;
    }

    intersectWith(otherPolygon) {
    
        const startingPoint = this.findStartingPoint(otherPolygon);
        if (!startingPoint) {
            throw new Error("No common starting point found between the polygons.");
        }
    
        let currentPoint = startingPoint;
        let result = [currentPoint];
        let currentPolygon = this;
        let otherPolygonRef = otherPolygon;
        let previousPoint = null;
        let visitedPoints = new Set(); // Pour détecter les cycles

        let nextPoint = this.nextPoint(currentPoint, currentPolygon, previousPoint);
        let secondPoint = this.nextPoint(nextPoint, currentPolygon, currentPoint);
        let sl = new StraightLine(currentPoint, nextPoint);
        let hp = new HalfPlane(sl, secondPoint);
        let i = 0;
        for (let point of otherPolygon.points) {
            if (hp.isIn(point)) {
                break;
            }
            i++;
        }
        if (i === otherPolygon.points.length) {
            return null;
        }

        if (hp.isIn(otherPolygon.nextPoint(currentPoint, otherPolygon, previousPoint))) {
            const temp = currentPolygon;
            currentPolygon = otherPolygonRef;
            otherPolygonRef = temp;
        }
        nextPoint = null;
        while (true) {
            const currentSegmentStart = currentPoint;
            const currentSegmentEnd = currentPolygon.nextPoint(currentPoint, currentPolygon, previousPoint);
    
            // Vérifier les chevauchements colinéaires
            let overlap = null;
            for (let i = 0; i < otherPolygonRef.points.length; i++) {
                const otherStart = otherPolygonRef.points[i];
                const otherEnd = otherPolygonRef.points[(i + 1) % otherPolygonRef.points.length];
                
                overlap = this.getCollinearOverlap(currentSegmentStart, currentSegmentEnd, otherStart, otherEnd);
                if (overlap) {
                    // Si chevauchement trouvé, on l'ajoute et on passe à l'autre polygone
                    if (!result.includes(overlap.start)) {
                        result.push(overlap.start);
                    }
                    if (overlap.end.equals(otherEnd)) {
                        const temp = currentPolygon;
                        currentPolygon = otherPolygonRef;
                        otherPolygonRef = temp;
                    }
    
                    nextPoint = overlap.end;
                    break;  // Sortir de la boucle pour passer au prochain segment
                }
            }
    
            // Calculer les intersections après avoir vérifié les chevauchements et arêtes partagées
            const intersections = currentPolygon.getIntersections(otherPolygonRef);
    
            // Si aucun chevauchement ou arête partagée n'est trouvé, chercher un prochain point
            if (!nextPoint) {
    
                // Vérifier si un candidat est valide (proche du segment courant)
                for (const candidate of [...intersections, ...currentPolygon.points]) {
                    if (candidate.equals(currentPoint) || (previousPoint && candidate.equals(previousPoint))) continue;
    
                    const onSegment = isOn(currentSegmentStart, currentSegmentEnd, candidate);
                    const between = isBetween(currentSegmentStart, currentSegmentEnd, candidate);
    
                    if (onSegment && between) {
                        if (intersections.includes(candidate)) {
                            const temp = currentPolygon;
                            currentPolygon = otherPolygonRef;
                            otherPolygonRef = temp;
                        }
                        nextPoint = candidate;
                        break;
                    }
                }
    
            }

            if (!nextPoint) {
                nextPoint = this.nextPoint(currentPoint, currentPolygon, previousPoint);
            }
    
            // Vérification des cycles
            if (visitedPoints.has(nextPoint)) {
                console.log("Cycle detected, terminating...");
                break;
            }
            visitedPoints.add(nextPoint);
    
            // Ajouter le point trouvé et vérifier si on a fait une boucle complète
            result.push(nextPoint);
            if (nextPoint.equals(startingPoint)) break;
    
            // Mettre à jour pour le prochain tour
            previousPoint = currentPoint;
            currentPoint = nextPoint;
            nextPoint = null;
        }
        
        result.pop();  // Enlever le dernier point qui est le même que le premier
        return new Polygon(result, true);
    }
    
    getCollinearOverlap(start1, end1, start2, end2) {
    
        const isCollinear = getTurn(start1, end1, start2) === DIRECTION.STRAIGHT && getTurn(start1, end1, end2) === DIRECTION.STRAIGHT;
        if (!isCollinear) {
            return null;
        }

        if (start1.x < end1.x !== start2.x < end2.x) {
            return null;
        }

        let overlapStart = null;
        let overlapEnd = null;
        
        if (start1.x < end1.x && start1.x < end2.x) {
            overlapStart = start1.x > start2.x ? start1 : start2;
            overlapEnd = end1.x < end2.x ? end1 : end2;
        } else if (start1.x > end1.x && start1.x > end2.x) {
            overlapStart = start1.x < start2.x ? start1 : start2;
            overlapEnd = end1.x > end2.x ? end1 : end2;
        } else if (start1.y < end1.y && start1.y < end2.y) {
            overlapStart = start1.y > start2.y ? start1 : start2;
            overlapEnd = end1.y < end2.y ? end1 : end2;
        } else if (start1.y > end1.y && start1.y > end2.y) {
            overlapStart = start1.y < start2.y ? start1 : start2;
            overlapEnd = end1.y > end2.y ? end1 : end2;
        } else {
            return null;
        }
    
        if (overlapStart.equals(overlapEnd)) {
            return null;
        }
    
        return { start: overlapStart, end: overlapEnd };
    }       

    nextPoint(currentPoint, polygon, previous = null) {
        // Trouver l'index du point actuel dans le polygone
        let currentIndex = polygon.points.findIndex(point => point.equals(currentPoint));
    
        // Si currentPoint n'est pas exactement un sommet, rechercher sur les segments
        if (currentIndex === -1) {
            for (let index = 0; index < polygon.points.length; index++) {
                const point = polygon.points[index];
                const point2 = polygon.points[(index + 1) % polygon.points.length];
                if (previous && point2.equals(previous)) continue;
    
                const sl = new StraightLine(point, point2);
                if (sl.isOn(currentPoint) && isBetween(point, point2, currentPoint)) {
                    return point2; // Retourne le prochain point du segment
                }
            }
        }
    
        // Si currentPoint est un sommet, retourner le suivant dans l'ordre
        return polygon.points[(currentIndex + 1) % polygon.points.length];
    }
}

function isOn(start, end, point) {
    const line = new StraightLine(start, end);
    return line.isOn(point);
}