import {isAcuteAngle, isLeftTurn, isRightTurn} from "../geometry/Point.js";
import {PocketPolygon, generatePocketChain} from './PocketPolygon.js'; // Import the PocketPolygon class

export class Attraction {

    static projection = [];

    static compute(poly, ret_val=false) {
        Attraction.projection = [];
        poly.compute();
        let ch = poly.getConvexHull() // step1
        let count = 0;
        while (ch.get(0) !== poly.get(0)) {
            count++;
            if (count > poly.points.length) {
                console.log("Error: The convex hull could not be computed");
                return;
            }
            poly.rotate();
        }
        if (Attraction.step2(ch, poly, ret_val)) {
            console.log("step2 passed");
            return Attraction.step3(poly);
        }
        return false;
    }

    static step2(ch, poly, ret_val) {
        for (let i = 0; i < ch.length(); i++) {
            let i_1 = (i + 1) % ch.length();
            const v_p = ch.get(i);
            const v_q = ch.get(i_1);
            while (poly.get(i) !== v_p) {
                poly.rotate();
            }
            if (v_p === poly.get(i) && v_q === poly.get((i + 1) % poly.length())){ // check if exists a pocket chain on the lid
                continue;
            }

            let pocket_chain = generatePocketChain(poly, v_p, v_q, i);
            let pocket_polygon = new PocketPolygon(pocket_chain);
            if (ret_val){
                Attraction.projection.push(pocket_polygon);
            }
            if (! pocket_polygon.isOrderedProjection()) {
                return false;
            }
        }
        return true;
    }

    static step3(polygon) {
        if (Attraction._ccwScan(polygon)) {
            console.log("step3.1 passed");
            return Attraction._cwScan(polygon);
        }
        return false;

    }

    static _ccwScan(polygon) {
        let s = [polygon.get(0)];
        for (let i = 1; i < polygon.length(); i++) {
            let v = polygon.get(i);
            let v_next = polygon.get((i+1) % polygon.length())
            let v_prev = polygon.get((i-1 + polygon.length()) % polygon.length());
            while (s.length !== 1 && isRightTurn(s[s.length - 2], s[s.length - 1], v)) {
                s.pop();
            }
            s.push(v);
            let c_prev = s[s.length - 2], c = s[s.length - 1];
            if (isRightTurn(c_prev, c, v_next) && isAcuteAngle(c_prev, c, v_next)) {
                return false;
            }
            if (isLeftTurn(c_prev, c, v_next) && isRightTurn(v_prev, v, v_next)) {
                return false;
            }
        }
        return true;

    }

    static  _cwScan(polygon) {
        // symmetric to _ccwScan
        let s = [polygon.get(polygon.length() - 1)];
        for (let i = polygon.length() - 2; i >= 0; i--) { // play with these index for clockwise
            let v = polygon.get(i);
            let v_prev = polygon.get((i+1) % polygon.length()); // inverted from ccwScan
            let v_next = polygon.get((i-1 + polygon.length()) % polygon.length());
            while (s.length !== 1 && isLeftTurn(s[s.length - 2], s[s.length - 1], v)) { //invert left and right since we are in the opposite sens
                s.pop();
            }
            s.push(v);
            let c_prev = s[s.length - 2], c = s[s.length - 1];
            if (isLeftTurn(c_prev, c, v_next) && isAcuteAngle(c_prev, c, v_next)) {
                return false;
            }
            if (isRightTurn(c_prev, c, v_next) && isLeftTurn(v_prev, v, v_next)) {
                return false;
            }
        }
        return true;
    }
}