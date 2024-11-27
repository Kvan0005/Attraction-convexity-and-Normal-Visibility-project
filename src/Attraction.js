import {isAcuteAngle, isLeftTurn, isRightTurn} from "./Point.js";
import {PocketPolygon, generatePocketChain} from './PocketPolygon.js'; // Import the PocketPolygon class

export class Attraction {

    static projection = [];

    static compute(poly, ret_val=false) {
        Attraction.projection = [];
        poly.compute();
        let ch = poly.getConvexHull()
        let count = 0;
        while (ch.get(0) !== poly.get(0)) {
            count++;
            if (count > poly.points.length) {
                p.textToDisplay = "Error: The convex hull could not be computed";
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
            //data_pocket_chain_on_lid.push(pocket_polygon)
            if (! pocket_polygon.isOrderedProjection()) {
                return false;
            }
        }
        return true;
    }

    static _ccwScan(polygon) {
        let s = [polygon.get(0)];
        for (let i = 1; i < polygon.length(); i++) { // play with these index for clockwise
            let v = polygon.get(i), v_next = polygon.get((i+1) % polygon.length()), v_prev = polygon.get((i-1 + polygon.length()) % polygon.length());
            console.log(`v: ${v.toString()}, v_next: ${v_next.toString()}, v_prev: ${v_prev.toString()}, c: ${s[s.length - 1].toString()}`)
            if (s.length > 1) console.log(`c_prev: ${s[s.length - 2].toString()}`)
            while (s.length !== 1 && isRightTurn(s[s.length - 2], s[s.length - 1], v)) {
                console.log("pop");
                s.pop();
            }
            s.push(v);
            console.log(`c_prev: ${s[s.length - 2].toString()}, c: ${s[s.length - 1].toString()}`)
            let c_prev = s[s.length - 2], c = s[s.length - 1];
            console.log(`RT ? ${c_prev}, ${c} ${v_next}`, isRightTurn(c_prev, c, v_next))
            if (isRightTurn(c_prev, c, v_next) && isAcuteAngle(c_prev, c, v_next)) {
                console.log("nop, acute angle");
                return false;
            }
            console.log(`LT ? ${c_prev}, ${c} ${v_next}`, isLeftTurn(c_prev, c, v_next))
            console.log(`RT ? ${v_prev}, ${v} ${v_next}`)
            if (isLeftTurn(c_prev, c, v_next) && isRightTurn(v_prev, v, v_next)) {
                console.log("nop2, rightTurn");
                return false;
            }
        }
        console.log("CCW scan passed");
        return true;

    }

    static  _cwScan(polygon) {
        let s = [polygon.get(polygon.length() - 1)];
        for (let i = polygon.length() - 2; i >= 0; i--) { // play with these index for clockwise
            let v = polygon.get(i), v_prev = polygon.get((i+1) % polygon.length()), v_next = polygon.get((i-1 + polygon.length()) % polygon.length());
            console.log(`v: ${v.toString()}, v_next: ${v_next.toString()}, v_prev: ${v_prev.toString()}, c: ${s[s.length - 1].toString()}`)
            if (s.length > 1) console.log(`c_prev: ${s[s.length - 2].toString()}`)
            while (s.length !== 1 && isLeftTurn(s[s.length - 2], s[s.length - 1], v)) {
                console.log("pop");
                s.pop();
            }
            s.push(v);
            console.log(`c_prev: ${s[s.length - 2].toString()}, c: ${s[s.length - 1].toString()}`)
            let c_prev = s[s.length - 2], c = s[s.length - 1];
            console.log(`LT ? ${c_prev}, ${c} ${v_next}`, isLeftTurn(c_prev, c, v_next))
            if (isLeftTurn(c_prev, c, v_next) && isAcuteAngle(c_prev, c, v_next)) {
                console.log("pon, acute angle");
                return false;
            }
            console.log(`RT ? ${c_prev}, ${c} ${v_next}`, isRightTurn(c_prev, c, v_next))
            console.log(`LT ? ${v_prev}, ${v} ${v_next}`)
            if (isRightTurn(c_prev, c, v_next) && isLeftTurn(v_prev, v, v_next)) {
                console.log("2pon, LeftTurn");
                return false;
            }
        }
        console.log("CW scan passed");
        return true;
    }

    static step3(polygon) {
        if (Attraction._ccwScan(polygon)) {
            return Attraction._cwScan(polygon); // not sure if it is correct, but it seems to work
        }
        return false;

    }

}