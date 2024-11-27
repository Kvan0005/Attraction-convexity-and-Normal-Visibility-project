import {Polygon} from "../Polygon.js";
import {det, isRightTurn} from "../Point.js";

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


export class ReactivePolygon {
    constructor(points = [], closed = false, color = [160, 220, 120]) {
        this.vertices = points;
        this.closed = closed;
        this.perimeter = 0;
        this.color = color;
    }

    setColor(color) {
        this.color = color;
    }

    add(vertex) {
        if (this.closed) return;
        if (this.length() < 3 || (!this.isCutting(vertex) && !this.closed)) { // either the polygon is not closed or the vertex is not cutting
            this.vertices.push(vertex);
        }
    }

    length() {
        return this.vertices.length;
    }

    reset(){
        this.vertices = [];
        this.closed = false;
    }

    close(p) {
        if (this.isCutting(new Point(p.mouseX, -p.mouseY))) return false;
        this.closed = p.millis();
        for (let i = 0; i < this.length() - 1; i++) {
            this.perimeter += p.dist(this.get(i).x, -this.get(i).y, this.get(i + 1).x, -this.get(i + 1).y);
        }
        return true;
    }

    isClosed() {
        return this.closed;
    }

    closedInstant(){
        return this.closed;
    }

    isNearFirstVertex(p) {
        if (this.length() === 0) return false;
        let distanceSq = (p.mouseX - this.get(0).x) ** 2 + (p.mouseY - -this.get(0).y) ** 2;
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
            p.vertex(this.get(i).x, -this.get(i).y);
        }
        p.vertex(p.mouseX, p.mouseY);
        p.endShape();

        // First vertex drawing
        if (this.length() > 0) {
            this.isNearFirstVertex(p) ? p.fill(255, 255, 255) : p.fill(0, 155, 184);
            this.get(0).draw(p, 10);
        }

        p.fill(0, 0, 0);
        for (let i = 1; i < this.length(); i++) {
            this.get(i).draw(p);
            let intersection = this.isCutting(new Point(p.mouseX, -p.mouseY))
            if (intersection) {
                let {a, b} = intersection
                p.fill(255, 0, 0);
                p.stroke(255, 0, 0);
                p.line(a.x, -a.y, b.x, -b.y);
                p.fill(0, 0, 0)
                p.stroke(0, 0, 0);
                p.strokeWeight(1);
            }
        }
    }

    drawEnded(p, observer) {
        let t = p.min(1, (p.millis() - this.closedInstant()) / 1000); // 0 <= t <= 1

        p.fill(this.color[0], this.color[1], this.color[2]);
        p.beginShape();

        if (t < 1) {
            let animationDistance = this.getPerimeter() * t;

            let d = 0; // length n-1 first edges
            let ld = 0; // length n-1 edge
            let n = 0; // targeted vertex

            while (d <= animationDistance) {
                ld = p.dist(this.get(n).x, -this.get(n).y, this.get(n + 1).x, -this.get(n + 1).y);
                d += ld;
                n++;
            }

            for (let i = 0; i < n; i++) {
                p.vertex(this.get(i).x, -this.get(i).y);
            }

            let relT = (animationDistance - d + ld) / ld;
            p.vertex(relT * this.get(n).x + (1 - relT) * this.get(n - 1).x, relT * -this.get(n).y + (1 - relT) * -this.get(n - 1).y);
        } else {
            // t = 1, polygon ended
            for (let v of this.vertices) {
                p.vertex(v.x, -v.y);
            }
            p.endShape(p.CLOSE);
            observer.notify()
        }

        p.endShape();
    }

    draw(p){
        p.fill(this.color[0], this.color[1], this.color[2], this.alpha);
        p.stroke(0, 0, 0, this.alpha)
        p.beginShape();
        for (let v of this.vertices) {
            p.vertex(v.x, -v.y);
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

    modularGet(index) {
        while (index < 0) {
            index += this.vertices.length;
        }
        return this.get(index % this.vertices.length);
    }

    toPolygon(){
        let p = new Polygon([...this.vertices], true);
        p.toCounterClockwiseOrder();
        return p;
    }

    getConvexHull(){
        if (this.isClosed()){
            return this.toPolygon().getConvexHull();
        }
        return null;
    }
}