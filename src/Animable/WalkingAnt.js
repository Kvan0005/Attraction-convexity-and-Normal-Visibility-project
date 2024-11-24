import {DIRECTION} from "../Const.js";

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


export class WalkingAnt {
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
        this.turn_nb = 0;
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

    draw(p, observer) {
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
            //end
            this.turn_nb++;
            observer.notify(this.turn_nb)
        }
    }
}