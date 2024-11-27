import {isAcuteAngle, isLeftTurn, isRightTurn, Point} from "./Point.js"; // Import the Point class
import {PocketPolygon, generatePocketChain} from './PocketPolygon.js'; // Import the PocketPolygon class
import { ReactivePolygon } from "./Animable/ReactivePolygon.js";
var poly = new ReactivePolygon(); // Create a new Polygon object
var ch;
var display_pocket_chain_projection_on_lid = false;
var text_to_display = "?"
var data_pocket_chain_on_lid = [];
var canvas;
var show_convex_hull = false;
var buttonList = [];
var sketch = new Sketch();
class Sketch{
    constructor() {
        this.polygon = new ReactivePolygon();
        this.phase = Phase.Draw;
        this.p;
        this.isAttractionConvex = null;
    }
    draw(){
        switch (this.phase) {
            case Phase.Draw: {
                this.polygon.drawAnimated(this.p, this);
                break;}
            case Phase.Explanation: {
                this.polygon.draw(this.p);
                if (this.isAttractionConvex) text_to_display = "True";
                else text_to_display = "False";
                break;}
        }
    }
    polygonIsClosed(){
        return this.polygon.isClosed();
    }
    isNearFirstVertexPolygon(p) {
        return this.polygon.isNearFirstVertex(p);
    }
    tryClosePolygon(p){
        if (this.polygon.close(p)) {
            this.isAttractionConvex = Attraction.compute(this.polygon.toPolygon());
            if (this.isAttractionConvex === false) {
                this.polygon.setColor([255, 126, 121]);
            }
        }
    }
    addPoint(point){
        this.polygon.add(point);
    }
}


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
        let height = p.height + 50;
        buttonList.push(generateButton(p.width / 2 + 170 , height, "Compute", () => {
            compute(p);
        }, p));
        buttonList.push(generateButton(p.width / 2 + 185, height , "Show convex hull", () => {
            show_convex_hull = !show_convex_hull;

        }, p));
        buttonList.push(generateButton(p.width / 2 + 185, height , "Show projection", () => {
            display_pocket_chain_projection_on_lid = !display_pocket_chain_projection_on_lid;
        }, p));
        buttonList.push(generateButton(p.width / 2 + 255, height , "Clear", reset_points, p));
        let width = p.width / 2 + 80;
        buttonList.forEach(element => {
            //place the button (element) to the right of the prevous one
            element.position(width, height);
            width += element.width +40;
        });
    }

    function generateButton(x, y, text, callback, p) {
        let button = p.createButton(text);
        button.width = text.length *5;
        button.position(x, y);
        button.mousePressed(callback);
        return button;
    }


    function reset_points() {
        poly.reset();
        data_pocket_chain_on_lid = [];
        ch = null;
        text_to_display = "?";
        show_convex_hull = false;
    }

    function compute(p) {

        poly.close(p);
        ch = poly.getConvexHull()
        if (ch === null) {
            text_to_display = "Error: the polygon is not closed";
            return;
        }
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

            let pocket_chain = generatePocketChain(poly, v_p, v_q, i); // note pocket_chain is a list of points (not a class)
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
            let v = polygon.get(i), v_next = polygon.modularGet(i+1), v_prev = polygon.modularGet(i-1);
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
        let s = [polygon.modularGet(-1)];
        for (let i = polygon.length() - 2; i >= 0; i--) { // play with these index for clockwise
            let v = polygon.get(i), v_prev = polygon.modularGet(i+1), v_next = polygon.modularGet(i-1);
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
        return ccwScan(polygon) && cwScan(polygon);
    }

    p.draw = function () {
        p.background(233, 230, 235);
        p.text(text_to_display, p.width / 2, 10);
        p.stroke("black");
        poly.draw(p);
        if (ch && show_convex_hull) {
            ch.draw(p);
        }
        if (data_pocket_chain_on_lid.length === 0 || !display_pocket_chain_projection_on_lid) return;
        data_pocket_chain_on_lid.forEach(element => {
            element.draw(p);
        });
    }

    p.mousePressed = function (event) {
        if (event.target === canvas.elt){ // we need to be in the canvas to draw not buttons or other elements
            if (sketch.polygonIsClosed())
                return;
    
            if (sketch.isNearFirstVertexPolygon(p)) {
                p.redraw();
                sketch.tryClosePolygon(p)
            } else {
                sketch.addPoint(new Point(p.mouseX, -p.mouseY));
            }
        }

        
    }

    p.windowResized = function () {
        let height = p.height - 100;
        let width = p.width / 2 -30;
        buttonList.forEach(element => {
            //place the button (element) to the right of the prevous one
            element.position(width, height);
            width += element.width +40;
        });
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }
}

new p5(s); // Create a new p5.js sketch