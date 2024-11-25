import {DIRECTION} from "./Const.js";

export class Point {
    static count = 0;

    constructor(x, y) {
        this.id = Point.count
        this.x = x;
        this.y = y;
        Point.count++;
    }

    draw(p, size) {
        if (size === undefined) size = 5;
        p.ellipse(this.x, -this.y, size, size);
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    toString() {
        return this.id;
    }
}

export function det(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p2.y) - (p2.y - p1.y) * (p3.x - p2.x);
}

export function getTurn(p1, p2, p3) {
    /*
    Returns the direction of the turn
    */
    let cross = det(p1, p2, p3);
    if (cross > 0) {
        return DIRECTION.LEFT;
    } else if (cross < 0) {
        return DIRECTION.RIGHT;
    } else {
        return DIRECTION.STRAIGHT;
    }
}

export function isLeftTurn(p1, p2, p3) {
    return getTurn(p1, p2, p3) === DIRECTION.LEFT;
}

export function isRightTurn(p1, p2, p3) {
    return getTurn(p1, p2, p3) === DIRECTION.RIGHT;
}

export function angle(p1, p2, p3) {
    const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
    const dotProduct = v1.x * v2.x + v1.y * v2.y;
    const normV1 = Math.sqrt(v1.x ** 2 + v1.y ** 2);
    const normV2 = Math.sqrt(v2.x ** 2 + v2.y ** 2);
    return Math.acos(dotProduct / (normV1 * normV2));
}

export function isAcuteAngle(p1, p2, p3) {
    return angle(p1, p2, p3) < Math.PI/2;
}