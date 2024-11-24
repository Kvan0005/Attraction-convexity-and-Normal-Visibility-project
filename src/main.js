import {Polygon} from "./Polygon.js"; // Import the Polygon class
import {isAcuteAngle, isLeftTurn, isRightTurn, Point} from "./Point.js"; // Import the Point class


var poly = new Polygon(); // Create a new Polygon object
var ch;
var clearButton;
var computeButton;
var display_pocket_chain_projection_on_lid = false;
var text_to_display = "?"

var data_pocket_chain_on_lid = [];
const s = (p) => {
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.fill("white");
        p.stroke("white");
        p.textSize(40);
        p.textAlign(p.CENTER, p.TOP);
        clearButton = p.createButton("Clear");
        computeButton = p.createButton("Compute");
        let xCompute = p.width / 2 - (computeButton.width + clearButton.width) / 2;
        let xClear = p.width / 2;
        let y = p.height - 50;
        computeButton.position(xCompute - 30, y);
        computeButton.mousePressed(compute);
        clearButton.position(xClear + 30, y);
        clearButton.mousePressed(reset_points);
        let displayButton = p.createButton("Display Pocket Chain Projection on Lid");
        displayButton.position(p.width / 2 - displayButton.width / 2, y + 50);
        displayButton.mousePressed(() => {
            display_pocket_chain_projection_on_lid = !display_pocket_chain_projection_on_lid;
        });
    }

    function reset_points() {
        poly.reset();
    }

    function compute() {

        poly.compute();
        ch = poly.getConvexHull()
        let count = 0;
        while (ch.get(0) !== poly.get(0)) {
            count++;
            if (count > poly.points.length) {
                p.textToDisplay = "Error: The convex hull could not be computed";
                return;
            }
            poly.rotate();
        }
        if (step2(ch, poly)) {console.log("step2 passed"); text_to_display = step3(poly) ? "True" : "False";}
        else {text_to_display = "False";}
        //console.log("ret_val->",ret_val);
    }

    function step2(ch, poly) {
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
                prime_pocket.push(projection(v_p, v_q, k));
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

    function ccwScan(polygon) {
        let s = [polygon.get(0)];
        for (let i = 1; i < polygon.length(); i++) { // play with these index for clockwise
            let v = polygon.get(i), v_next = polygon.get((i+1) % polygon.length()), v_prev = polygon.get((i-1 + polygon.length()) % polygon.length());
            while (s.length !== 1 && isRightTurn(s[s.length - 2], s[s.length - 1], v)) s.pop();
            s.push(v);
            let c_prev = s[s.length - 2], c = s[s.length - 1];
            if (isRightTurn(c_prev, c, v_next) && isAcuteAngle(c_prev, c, v_next)) {
                console.log("nop");
                return false;
            }
            if (isLeftTurn(c_prev, c, v_next) && isRightTurn(v_prev, v, v_next)) {
                console.log("nop2");
                return false;
            }
        }
        console.log("yeepee");
        return true;

    }

    function cwScan(polygon) {
        let s = [polygon.get(polygon.length() - 1)];
        for (let i = polygon.length() - 2; i >= 0; i--) { // play with these index for clockwise
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

    function step3(polygon) {
        if (ccwScan(polygon)) {
            return cwScan(polygon); // not sure if it is correct, but it seems to work
        }
        return false;

    }

    function projection(p, q, k) {
        let dot = (k.x - p.x) * (q.x - p.x) + (k.y - p.y) * (q.y - p.y);
        let norm = Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2);
        let t = dot / norm;
        return new Point(p.x + t * (q.x - p.x), p.y + t * (q.y - p.y));
    }


    p.draw = function () {
        p.background(122, 158, 128);
        p.text(text_to_display, p.width / 2, 10);
        poly.draw(p);
        if (ch) {
            ch.draw(p);
        }
        if (data_pocket_chain_on_lid.length === 0 || !display_pocket_chain_projection_on_lid) return;
        for (let j = 0;j < data_pocket_chain_on_lid.length; j++) {
            p.stroke("black");
            p.fill("black");
            p.line(data_pocket_chain_on_lid[j][0][0].x, -data_pocket_chain_on_lid[j][0][0].y, data_pocket_chain_on_lid[j][0][1].x, -data_pocket_chain_on_lid[j][0][1].y);
            p.fill("blue");
            p.stroke("blue");
            for (let i = 1; i < data_pocket_chain_on_lid[j].length; i++) {
                p.line(data_pocket_chain_on_lid[j][i][0].x, -data_pocket_chain_on_lid[j][i][0].y, data_pocket_chain_on_lid[j][i][1].x, -data_pocket_chain_on_lid[j][i][1].y);
            }
            p.fill("white");
            p.stroke("white");
        }
    }

    p.mousePressed = function () {
        const rect = p.canvas.getBoundingClientRect();
        if (!(
            p.mouseX >= 0 &&
            p.mouseX <= rect.width &&
            p.mouseY >= 0 &&
            p.mouseY <= rect.height)
        ) return;

        let computeButtonX = computeButton.position().x;
        let computeButtonWidth = computeButton.width;
        let computeButtonHeight = computeButton.height;

        let clearButtonX = clearButton.position().x;

        let y = computeButton.position().y;

        let clearButtonWidth = clearButton.width;
        let clearButtonHeight = clearButton.height;

        if (
            !(
                p.mouseX > computeButtonX &&
                p.mouseX < computeButtonX + computeButtonWidth &&
                p.mouseY > y &&
                p.mouseY < y + computeButtonHeight
            ) &&
            !(
                p.mouseX > clearButtonX &&
                p.mouseX < clearButtonX + clearButtonWidth &&
                p.mouseY > y &&
                p.mouseY < y + clearButtonHeight
            )
        ) {
            poly.addPoint(new Point(p.mouseX, -p.mouseY));
        }
    }

    p.windowResized = function () {
        let xCompute = p.width / 2 - computeButton.width - 5;
        let xClear = p.width / 2 - clearButton.width + 5;
        let y = p.height - 50;
        computeButton.position(xCompute - 30, y);
        clearButton.position(xClear + 30, y);
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }
}

new p5(s); // Create a new p5.js sketch