import {DIRECTION} from "./Const.js";

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(p) {
        p.ellipse(this.x, -this.y, 5, 5);
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