import {Polygon} from "../Polygon.js";
import {DIRECTION} from "../Const.js";
import {Point} from "./Home/HomeSketch.js";

function det(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
}

function getTurn(p1, p2, p3) {
    /*
    Returns the direction of the turn
    */
    let cross = det(p1, p2, p3);
    if (cross < 0) {
        return DIRECTION.LEFT;
    } else if (cross > 0) {
        return DIRECTION.RIGHT;
    } else {
        return DIRECTION.STRAIGHT;
    }
}

function isLeftTurn(p1, p2, p3) {
    return getTurn(p1, p2, p3) === DIRECTION.LEFT;
}

function isRightTurn(p1, p2, p3) {
    return getTurn(p1, p2, p3) === DIRECTION.RIGHT;
}

export class ReactivePolygon {
    constructor(points, closed) {
        points ? this.vertices = points : this.vertices = [];
        closed ? this.closed = closed : this.closed = false;
        this.perimeter = 0;
    }

    add(vertex) {
        if (this.closed) return;
        if (this.length() < 3) {
            this.vertices.push(vertex);
        } else if (this.isCutting(vertex)) {
            //textToDisplay = "Do not cut an edge";
        } else if (!this.closed) {
            this.vertices.push(vertex);
        }
    }

    length() {
        return this.vertices.length;
    }

    close(p) {
        this.closed = p.millis();
        for (let i = 0; i < this.length() - 1; i++) {
            this.perimeter += p.dist(this.get(i).x, this.get(i).y, this.get(i + 1).x, this.get(i + 1).y);
        }
    }

    isClosed() {
        return this.closed;
    }

    closedInstant(){
        return this.closed;
    }

    isNearFirstVertex(p) {
        if (this.length() === 0) return false;
        let distanceSq = (p.mouseX - this.get(0).x) ** 2 + (p.mouseY - this.get(0).y) ** 2;
        return distanceSq < 49;
    };

    getPerimeter(){
        return this.perimeter;
    }

    toCounterClockwiseOrder() {
        let p = this.downmostPoint();
        let pIndex = this.vertices.indexOf(p);
        let pMinus = pIndex - 1 >= 0 ? this.vertices[pIndex - 1] : this.vertices[this.length() - 1];
        let pPlus = this.vertices[(pIndex + 1) % this.length()];

        if (isRightTurn(pMinus, p, pPlus)) {
            this.vertices.reverse();
        }
    }


    leftmostPoint() {
        return this.vertices.reduce(
            (min, current) => (current.x < min.x ? current : min),
            this.vertices[0]
        );
    }

    downmostPoint() {
        return this.vertices.reduce(
            (min, current) => (current.y < min.y ? current : min),
            this.vertices[0]
        );
    }

    isCutting(point) {
        let p = this.vertices[this.length() - 1];
        for (let i = 0; i < this.length() - 1; i++) {
            let a = this.vertices[i], b = this.vertices[i + 1];

            let turn1 = det(point, p, a) <= 0;
            let turn2 = det(point, p, b) <= 0;
            if (turn1 !== turn2) {
                let turn3 = det(a, b, point) <= 0;
                let turn4 = det(a, b, p) <= 0;
                if (turn3 !== turn4) return {a, b};
            }
        }
        return false;
    }

    drawAnimated(p, observer) {
        if (!this.isClosed()) {
            this.drawInConstruction(p)
        }
        else {
            this.drawEnded(p, observer)
        }
    }

    drawInConstruction(p) {
        p.noFill();
        p.beginShape();
        for (let i = 0; i < this.length(); i++) {
            p.vertex(this.get(i).x, this.get(i).y);
        }
        p.vertex(p.mouseX, p.mouseY);
        p.endShape();

        // First vertex drawing
        if (this.length() > 0) {
            this.isNearFirstVertex(p) ? p.fill(255, 255, 255) : p.fill(200, 50, 30);
            this.get(0).draw(p, 10);
        }

        p.fill(0, 0, 0);
        for (let i = 1; i < this.length(); i++) {
            this.get(i).draw(p);
            let intersection = this.isCutting(new Point(p.mouseX, p.mouseY))
            if (intersection) {
                let {a, b} = intersection
                p.fill(255, 0, 0);
                p.stroke(255, 0, 0);
                p.line(a.x, a.y, b.x, b.y);
                p.fill(0, 0, 0)
                p.stroke(0, 0, 0);
                p.strokeWeight(1);
            }
        }
    }

    drawEnded(p, observer) {
        let t = p.min(1, (p.millis() - this.closedInstant()) / 1000); // 0 <= t <= 1

        p.fill(160, 220, 120);
        p.beginShape();

        if (t < 1) {
            let animationDistance = this.getPerimeter() * t;

            let d = 0; // length n-1 first edges
            let ld = 0; // length n-1 edge
            let n = 0; // targeted vertex

            while (d <= animationDistance) {
                ld = p.dist(this.get(n).x, this.get(n).y, this.get(n + 1).x, this.get(n + 1).y);
                d += ld;
                n++;
            }

            for (let i = 0; i < n; i++) {
                p.vertex(this.get(i).x, this.get(i).y);
            }

            let relT = (animationDistance - d + ld) / ld;
            p.vertex(relT * this.get(n).x + (1 - relT) * this.get(n - 1).x, relT * this.get(n).y + (1 - relT) * this.get(n - 1).y);
        } else {
            // t = 1, polygon ended
            for (let v of this.vertices) {
                p.vertex(v.x, v.y);
            }
            p.endShape(p.CLOSE);
            observer.notify()
        }

        p.endShape();
    }

    draw(p){
        p.fill(160, 220, 120, this.alpha);
        p.stroke(0, 0, 0, this.alpha)
        p.beginShape();
        for (let v of this.vertices) {
            p.vertex(v.x, v.y);
        }
        p.endShape(p.CLOSE);
    }

    get(index) {
        if (index < 0 || index > this.vertices.length) {
            console.log("Index Error: ", index);
            return null;
        }
        return this.vertices[index]
    }

    toPolygon(){
        return new Polygon(this.vertices, true)
    }
}