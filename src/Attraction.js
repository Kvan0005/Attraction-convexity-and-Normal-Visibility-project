import {isAcuteAngle, isLeftTurn, isRightTurn, Point} from "./Point.js";

export class Attraction {

    static compute(poly) {
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
        if (Attraction.step2(ch, poly)) {
            console.log("step2 passed");
            return Attraction.step3(poly);
        }
        return false;
    }

    static step2(ch, poly) {
        let cnt=0;
        for (let i = 0; i < ch.length(); i++) {
            console.log(i);
            let i_1 = (i + 1) % ch.length();
            const v_p = ch.get(i);
            const v_q = ch.get(i_1);
            while (poly.get(i) !== v_p) {
                poly.rotate();
            }
            if (v_p === poly.get(i) && v_q === poly.get((i + 1) % poly.length())){
                continue;
            }
            let pocket_chain = [v_p];
            let index = (i + 1) % poly.length();
            while (poly.get(index) !== v_q) {
                pocket_chain.push(poly.get(index));
                index = (index + 1) % poly.length();
            }
            pocket_chain.push(v_q);

            const order = v_p.x < v_q.x ? 1 : -1; //! this considering general position which x-coordinates are different
            let prime_pocket = [];
            for (let i = 0; i < pocket_chain.length; i++) {
                let k = pocket_chain[i];
                prime_pocket.push(Attraction.projection(v_p, v_q, k));
                if (i === 0) {
                    continue;
                }
                if (order*prime_pocket[i].x < order*prime_pocket[i - 1].x){
                    return false;
                }
            }

            data_pocket_chain_on_lid.push([[v_p, v_q]])
            for (let i = 0; i < prime_pocket.length; i++) {
                data_pocket_chain_on_lid[cnt].push([prime_pocket[i], pocket_chain[i]])
            }
            cnt++;

        }
        return true;
    }

    static ccwScan(polygon) {
        let s = [polygon.leftmostPoint()];
        for (let i = 0; i < polygon.length(); i++) { // play with these index for clockwise
            let v = polygon.get(i), v_next = polygon.get((i+1) % polygon.length()), v_prev = polygon.get((i-1 + polygon.length()) % polygon.length());
            while (s.length !== 1 && isRightTurn(s[s.length - 2], s[s.length - 1], v)) s.pop();
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

    static cwScan(polygon) {
        let s = [polygon.leftmostPoint()];
        for (let i = polygon.length() - 1; i <= 0; i--) { // play with these index for clockwise
            let v = polygon.get(i), v_prev = polygon.get((i+1) % polygon.length()), v_next = polygon.get((i-1 + polygon.length()) % polygon.length());
            while (s.length !== 1 && isLeftTurn(s[0], s[s.length - 1], v)) s.pop();
            s.push(v);
            let c_prev = s[0], c = s[s.length - 1];
            if (isLeftTurn(c_prev, c, v_next) && isAcuteAngle(c_prev, c, v_next)) {
                console.log("pon");
                return false;
            }
            if (isRightTurn(c_prev, c, v_next) && isLeftTurn(v_prev, v, v_next)) {
                console.log("2pon");
                return false;
            }
        }
        console.log("eepeey");
        return true;
    }

    static step3(polygon) {
        if (Attraction.ccwScan(polygon)) {
            return Attraction.cwScan(polygon); // not sure if it is correct, but it seems to work
        }
        return false;

    }

    static projection(p, q, k) {
        let dot = (k.x - p.x) * (q.x - p.x) + (k.y - p.y) * (q.y - p.y);
        let norm = Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2);
        let t = dot / norm;
        return new Point(p.x + t * (q.x - p.x), p.y + t * (q.y - p.y));
    }
}