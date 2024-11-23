export const DIRECTION = {
    LEFT: "left",
    RIGHT: "right",
    STRAIGHT: "straight",
};

class Phase {
    static EndVisible = new Phase('EndVisible');
    static WalkAnt = new Phase('WalkAnt', Phase.EndVisible);
    static ImagineAnt = new Phase('ImagineAnt', Phase.WalkAnt);
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
        for (let i = 0; i < polygon.length() - 1; i++) {
            this.perimeter += p.dist(polygon.get(i).x, polygon.get(i).y, polygon.get(i + 1).x, polygon.get(i + 1).y);
        }
    }

    isClosed() {
        return this.closed;
    }

    closedInstant(){
        return this.closed;
    }

    isNearFirstVertex(p) {
        if (polygon.length() === 0) return false;
        let distanceSq = (p.mouseX - polygon.get(0).x) ** 2 + (p.mouseY - polygon.get(0).y) ** 2;
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

    draw(p) {
        if (!polygon.isClosed()) {
            polygon.drawInConstruction(p)
        }
        else {
            polygon.drawEnded(p)
        }
    }

    drawInConstruction(p) {
        p.noFill();
        p.beginShape();
        for (let i = 0; i < polygon.length(); i++) {
            p.vertex(polygon.get(i).x, polygon.get(i).y);
        }
        p.vertex(p.mouseX, p.mouseY);
        p.endShape();

        // First vertex drawing
        if (polygon.length() > 0) {
            polygon.isNearFirstVertex(p) ? p.fill(255, 255, 255) : p.fill(200, 50, 30);
            polygon.get(0).draw(p, 10);
        }

        p.fill(0, 0, 0);
        for (let i = 1; i < polygon.length(); i++) {
            //p.circle(polygon.get(i).x, polygon.get(i).y, 5);
            polygon.get(i).draw(p);
            let intersection = polygon.isCutting(new Point(p.mouseX, p.mouseY))
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
        let t = p.min(1, (p.millis() - polygon.closedInstant()) / 1000); // 0 <= t <= 1

        p.fill(160, 220, 120);
        p.beginShape();

        if (t < 1) {
            let animationDistance = polygon.getPerimeter() * t;

            let d = 0; // length n-1 first edges
            let ld = 0; // length n-1 edge
            let n = 0; // targeted vertex

            while (d <= animationDistance) {
                ld = p.dist(polygon.get(n).x, polygon.get(n).y, polygon.get(n + 1).x, polygon.get(n + 1).y);
                d += ld;
                n++;
            }

            for (let i = 0; i < n; i++) {
                p.vertex(polygon.get(i).x, polygon.get(i).y);
            }

            let relT = (animationDistance - d + ld) / ld;
            p.vertex(relT * polygon.get(n).x + (1 - relT) * polygon.get(n - 1).x, relT * polygon.get(n).y + (1 - relT) * polygon.get(n - 1).y);
        } else {
            // t = 1, polygon ended
            for (let i = 0; i < polygon.length(); i++) {
                p.vertex(polygon.get(i).x, polygon.get(i).y);
            }
            p.vertex(polygon.get(0).x, polygon.get(0).y);
            //p.noLoop();
            phase = phase.next()
        }

        p.endShape();
    }

    drawInstantly(p){
        p.fill(160, 220, 120);
        p.stroke(0, 0, 0)
        p.beginShape();
        for (let i = 0; i < polygon.length(); i++) {
            p.vertex(polygon.get(i).x, polygon.get(i).y);
        }
        p.vertex(polygon.get(0).x, polygon.get(0).y);
        p.endShape();
    }

    get(index) {
        if (index < 0 || index > this.vertices.length) {
            console.log("Index Error: ", index);
            return null;
        }
        return this.vertices[index]
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
            phase = phase.next()
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
        p.strokeWeight(2);
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
            console.log("ended")
            p.noLoop();
        }
    }
}


let polygon = new ReactivePolygon(); // Sommets du polygone
var phase = Phase.Draw
var phase2Dialogs = new Dialog(
    [new AnimatedText("This polygon is Attraction Convex", 3000, 1000,),
        new AnimatedText("It means that every point of the polygon can attract every others one", 3000, 1000)]);
var ant = new WalkingAnt(polygon);

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
            case Phase.Draw: {polygon.draw(p); break;}
            case Phase.Explanation: {polygon.toCounterClockwiseOrder()
                                     phase2Dialogs.draw(p);
                                     polygon.drawInstantly(p);
                                     break;}
            case Phase.ImagineAnt: {ant.init(p);
                                    polygon.drawInstantly(p);
                                    ant.draw(p);
                                    break;}
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