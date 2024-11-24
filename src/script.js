import {DIRECTION} from "./Const.js";
import {Attraction} from "./Attraction.js";
import {Polygon} from "./Polygon.js";


class Phase {
    static EndVisible = new Phase('EndVisible');
    static ImagineAnt = new Phase('ImagineAnt', Phase.EndVisible);
    static Explanation = new Phase('Explanation', Phase.ImagineAnt);
    static Draw = new Phase('Draw', Phase.Explanation);

    constructor(name, next) {
        this.name = name;
        this.n = next;
    }
    toString() {
        return `Phase.${this.name}`;
    }

    next() {
        return this.n;
    }

    notify(f, p){
        switch(f) {
            case Phase.Draw: {
                phase = this.next(); break;
            }
            case Phase.Explanation: {
                phase = this.next(); break;
            }
            case Phase.ImagineAnt: {
                phase = this.next(); ant.restart(); break;
            }
            case Phase.EndVisible: {
                p.noLoop();
            }
        }
    }
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(p, size) {
        if (size === undefined) size = 5;
        p.ellipse(this.x, this.y, size, size);
    }
}

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


class ReactivePolygon {
    constructor(points, closed) {
        points ? this.vertices = points : this.vertices = [];
        closed ? this.closed = closed : this.closed = false;
        this.ordered = false;
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
        if (this.ordered) return;
        let p = this.downmostPoint();
        let pIndex = this.vertices.indexOf(p);
        let pMinus = pIndex - 1 >= 0 ? this.vertices[pIndex - 1] : this.vertices[this.length() - 1];
        let pPlus = this.vertices[(pIndex + 1) % this.length()];

        if (isRightTurn(pMinus, p, pPlus)) {
            this.vertices.reverse();
        }
        this.ordered = true;
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

    drawAnimated(p) {
        if (!this.isClosed()) {
            this.drawInConstruction(p)
        }
        else {
            this.drawEnded(p)
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

    drawEnded(p) {
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
            //p.noLoop();
            phase.notify(phase, p)
            //phase = phase.next()
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

class AnimatedText{
    constructor(message, displayDuration, fadeDuration) {
        this.startTime = 0;
        this.displayDuration = displayDuration;
        this.fadeDuration = fadeDuration;
        this.message = message;
        this.ended = false;
    }

    start(p){
        this.startTime = p.millis();
    }

    draw(p) {
        if (this.startTime === 0) this.start(p);
        let elapsedTime = p.millis() - this.startTime;

        // opacity computing
        let alpha = 0;
        if (elapsedTime < this.fadeDuration) {
            // fade in
            alpha = p.map(elapsedTime, 0, this.fadeDuration, 0, 255);
        } else if (elapsedTime < this.displayDuration - 2 * this.fadeDuration) {
            // maintain
            alpha = 255;
        } else if (elapsedTime < this.displayDuration) {
            // fade out
            alpha = p.map(elapsedTime, this.displayDuration - this.fadeDuration, this.displayDuration, 255, 0);
        }

        p.fill(0, 0, 0, alpha);
        p.stroke(0, 0, 0, alpha);
        p.text(this.message, p.width / 2, 10);

        // Arrêter l'animation après 5 secondes
        if (elapsedTime > this.displayDuration) {
            //console.log("hehe")
            this.ended = true;
            //p.noLoop();
        }
    }

    isEnded(){
        return this.ended;
    }
}

class Dialog {
    constructor(messages) {
        this.messages = messages;
        this.current = 0;
    }

    draw(p) {
        //console.log(this.current)
        if (this.current < this.messages.length) {
            let txt = this.messages[this.current];
            txt.draw(p);
            if (txt.isEnded()) this.current += 1;
        } else {
            phase.notify(phase, p)
            //phase = phase.next()
            //p.noLoop();
        }
    }
}

class WalkingAnt {
    constructor(polygon) {
        this.polygon = polygon

        this.totalTime = 4000;
        this.totalRotationTime = 1000;
        this.startTime;
        this.distance = 0;

        this.timePerEdge;
        this.timePerRotation;

        this.inRotation = false;
        this.rotationStartAngle = 0;
        this.rotationTargetAngle = 0;
        this.rotationProgress = 0;

        this.currentEdge = 0;
    }

    init(p){
        if (this.timePerEdge !== undefined) return;
        this.timePerEdge = this.totalTime / (this.polygon.length() - 1) | 0;
        this.timePerRotation = this.totalRotationTime / this.polygon.length() | 0;
        this.calculateDistance(p, this.polygon.get(0), this.polygon.get(1));
    }

    restart(){
        this.currentEdge = 0;
    }

    calculateDistance(p, start, end) {
        this.distance = p.dist(start.x, start.y, end.x, end.y);
        this.startTime = p.millis();
    }

    calculateRotation(p, start, end, nextEnd) {
        this.rotationStartAngle = Math.atan2(end.y - start.y, end.x - start.x) + Math.PI / 2;
        let rawTargetAngle = Math.atan2(nextEnd.y - end.y, nextEnd.x - end.x) + Math.PI / 2;
        console.log(this.rotationStartAngle, rawTargetAngle);
        this.rotationTargetAngle = rawTargetAngle;

        if (isLeftTurn(start, end, nextEnd)) {
            this.rotationTargetAngle = this.normalizeAngle(this.rotationTargetAngle, this.rotationStartAngle);
        } else {
            this.rotationTargetAngle = this.normalizeAngle(this.rotationTargetAngle, this.rotationStartAngle + 2 * Math.PI);
        }

        this.rotationProgress = 0;
        this.inRotation = true;
        this.startTime = p.millis();
    }

    normalizeAngle(target, start) {
        let delta = target - start;
        delta = (delta + Math.PI) % (2 * Math.PI) - Math.PI; // [-PI, PI]
        if (delta > 0) { delta -= 2 * Math.PI;}

        return start + delta;
    }

    getPositionAndLightAngle(p, start, end, next_end) {
        let elapsedTime = p.millis() - this.startTime;
        if (elapsedTime > this.timePerEdge) { elapsedTime = this.timePerEdge; }
        let progress = elapsedTime / this.timePerEdge;
        let distanceTravelled = progress * this.distance;

        //console.log(distanceTravelled, this.distance);
        if (distanceTravelled <= this.distance) {
            let ratio = distanceTravelled / this.distance;

            let x = p.lerp(start.x, end.x, ratio);
            let y = p.lerp(start.y, end.y, ratio);

            // Light
            let edgeAngle = Math.atan2(end.y - start.y, end.x - start.x);
            let perpendicularAngle = edgeAngle + Math.PI/2;

            if (distanceTravelled === this.distance) {
                this.calculateRotation(p, start, end, next_end)
            }
            return { point: { x, y }, angle: perpendicularAngle };
        }
    }

    rotate(p, current, end) {
        let elapsedTime = p.millis() - this.startTime;

        if (elapsedTime < this.timePerRotation) {
            this.rotationProgress = elapsedTime / this.timePerRotation;
            let currentAngle = p.lerp(this.rotationStartAngle, this.rotationTargetAngle, this.rotationProgress);

            this.drawPointAndLine(p, current.x, current.y, current, null, currentAngle);
        } else {
            this.inRotation = false;
            this.currentEdge += 1;
            this.calculateDistance(p, current, end);
        }
    }

    drawPointAndLine(p, x, y, start, end, angle = null) {
        p.fill(255, 0, 0);
        p.noStroke();
        p.ellipse(x, y, 10, 10);

        if (angle === null && start && end) {
            angle = Math.atan2(end.y - start.y, end.x - start.x) + Math.PI/2;
        }

        // Dessiner la demi-droite
        let lineLength = 500;
        let endX = x + lineLength * Math.cos(angle);
        let endY = y + lineLength * Math.sin(angle);

        p.stroke(0, 0, 255);
        //p.strokeWeight(2);
        p.line(x, y, endX, endY);
    }

    draw(p) {
        if (this.currentEdge < this.polygon.length()) {
            let start = this.polygon.get(this.currentEdge);
            let end = this.polygon.get((this.currentEdge + 1) % this.polygon.length());
            let nextEnd = this.polygon.get((this.currentEdge + 2) % this.polygon.length());

            //console.log(start, end, nextEnd);

            if (!this.inRotation) {
                let {point, angle} = this.getPositionAndLightAngle(p, start, end, nextEnd);
                this.drawPointAndLine(p, point.x, point.y, start, end, angle);
            } else {
                this.rotate(p, end, nextEnd);
            }
        }
        else {
            //console.log("ended")
            if (phase === Phase.ImagineAnt) {
                phase.notify(phase, p)
                //phase = phase.next();
                //this.restart();
            }
            //p.noLoop();
        }
    }
}


let polygon = new ReactivePolygon(); // Sommets du polygone
var phase = Phase.Draw
var phase2Dialogs = new Dialog(
    [new AnimatedText("This polygon is Attraction Convex", 3000, 1000,),
               new AnimatedText("It means that every point of the polygon " +
                                         "can attract every others one", 3000, 1000),
               new AnimatedText("", 500),
               new AnimatedText("Now, let's imagine an ant walking counterclockwise\n" +
                                         " with a laser on its right on the edges...", 4000, 500)]);

var negPhase2Dialogs = new Dialog(
    [new AnimatedText("This polygon is not Attraction Convex", 3000, 1000,),
        new AnimatedText("It means that at least one point of the polygon " +
            "cannot attract every others one", 3000, 1000),
        new AnimatedText("", 500),
        new AnimatedText("Now, let's imagine an ant walking counterclockwise\n" +
            " with a laser on its right on the edges...", 4000, 500)]);


var ant = new WalkingAnt(polygon);
var phase4Dialogs = new Dialog(
    [
        new AnimatedText("The laser hit the polygon.", 3000, 1000,),
        new AnimatedText("Which means the polygon is not Normally Visible", 3000, 1000),
        new AnimatedText("Normal visibility is another way to describe attraction convexity", 5000, 1000),
        new AnimatedText("These Notions are subject of our study.", 3000, 1000)
    ]);

var isAttractionConvex = false;

const s = (p) => {
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.textSize(40);
        p.textAlign(p.CENTER, p.TOP);
    };

    p.draw = function () {
        p.background(255, 255, 255);
        p.stroke(0, 0, 0);
        p.strokeWeight(1);
        switch (phase) {
            case Phase.Draw: {polygon.drawAnimated(p); break;}
            case Phase.Explanation: { isAttractionConvex = Attraction.compute(polygon.toPolygon())
                                     polygon.toCounterClockwiseOrder();
                                     phase2Dialogs.draw(p);
                                     polygon.draw(p);
                                     break;}
            case Phase.ImagineAnt: {ant.init(p);
                                    polygon.draw(p);
                                    ant.draw(p);
                                    break;}
            case Phase.EndVisible: {
                                    ant.draw(p);
                                    polygon.draw(p);
                                    phase4Dialogs.draw(p);
            }
        }
    };

    p.mousePressed = function () {
        if (polygon.isClosed())
            return;

        if (polygon.isNearFirstVertex(p)) {
            p.redraw();
            polygon.close(p)
        } else {
            polygon.add(new Point(p.mouseX, p.mouseY));
        }
    };

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
}

new p5(s); // Create a new p5.js sketch