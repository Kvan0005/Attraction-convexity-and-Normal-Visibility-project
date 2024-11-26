import {Polygon} from "./Polygon.js"; // Import the Polygon class
import {isAcuteAngle, isLeftTurn, isRightTurn, Point} from "./Point.js"; // Import the Point class
import {PocketPolygon, generatePocketChain} from './PocketPolygon.js'; // Import the PocketPolygon class

var poly = new Polygon(); // Create a new Polygon object
var ch;
var clearButton;
var computeButton;
var display_pocket_chain_projection_on_lid = false;
var text_to_display = "?"
var data_pocket_chain_on_lid = [];
var canvas;
const s = (p) => {
    p.setup = function () {
        const parent = document.getElementById('toolContainer'); // Récupérer le parent
        const parentBounds = parent.getBoundingClientRect(); // Obtenir les dimensions du parent
        canvas = p.createCanvas(parentBounds.width, parentBounds.height); // Taille du canvas = parent
        canvas.parent('toolContainer');

        p.fill("white");
        p.stroke("white");
        p.textSize(40);
        p.textAlign(p.CENTER, p.TOP);
        clearButton = generateButton(p.width / 2 - 50, p.height - 50, "Clear", reset_points, p);
        computeButton = generateButton(p.width / 2 + 50, p.height - 50, "Compute", compute, p);
       generateButton(p.width / 2 - 50, p.height - 100, "Display Pocket Chain Projection on Lid", () => {
            display_pocket_chain_projection_on_lid = !display_pocket_chain_projection_on_lid;
        }, p);
    }

    function generateButton(x, y, text, callback, p) {
        let button = p.createButton(text);
        button.position(x, y);
        button.mousePressed(callback);
        return button;
    }


    function reset_points() {
        poly.reset();
        data_pocket_chain_on_lid = [];
        ch = null;
        text_to_display = "?";
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
            data_pocket_chain_on_lid.push(pocket_polygon)
            if (! pocket_polygon.isOrderedProjection()) {
                return false;
            }
        }
        return true;
    }

    function ccwScan(polygon) {
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

    function cwScan(polygon) {
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

    function step3(polygon) {
        if (ccwScan(polygon)) {
            return cwScan(polygon); // not sure if it is correct, but it seems to work
        }
        return false;

    }

    p.draw = function () {
        p.background(233, 230, 235);
        p.text(text_to_display, p.width / 2, 10);
        p.stroke("black");
        poly.draw(p);
        if (ch) {
            ch.draw(p);
        }
        if (data_pocket_chain_on_lid.length === 0 || !display_pocket_chain_projection_on_lid) return;
        data_pocket_chain_on_lid.forEach(element => {
            element.draw(p);
        });
    }

    p.mousePressed = function (event) {
        if (event.target === canvas.elt){
            console.log("canvas");
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