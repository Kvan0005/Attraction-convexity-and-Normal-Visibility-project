import {Polygon} from "./Polygon.js"; // Import the Polygon class
import {isRightTurn, Point} from "./Point.js"; // Import the Point class


var poly = new Polygon(); // Create a new Polygon object
var ch;
var clearButton;
var computeButton;
var display_pocket_chain_projection_on_lid = false;

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
        step2(ch, poly);
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
            let pocket_chain = [];
            let index = (i + 1) % poly.length();
            while (poly.get(index) !== v_q) {
                pocket_chain.push(poly.get(index));
                index = (index + 1) % poly.length();
            }

            let prime_pocket = [];
            for (let i = 0; i < pocket_chain.length; i++) {
                let k = pocket_chain[i];
                prime_pocket.push(projection(v_p, v_q, k));
            }

            data_pocket_chain_on_lid.push([[v_p, v_q]])
            for (let i = 0; i < prime_pocket.length; i++) {
                data_pocket_chain_on_lid[cnt].push([prime_pocket[i], pocket_chain[i]])
            }
            cnt++;
            
        }
    }

    function ccwScan(polygon) {
        let S = [polygon.leftmostPoint()]
        for (let i = 0; i < polygon.length(); i++) {
            while (S.length !== 1 && isRightTurn(S[S.length - 2], S[S.length - 1], v_i)) { S.pop() }
        }

    }

    // WARNING: This function is not implemented correctly and is BUGGY
    function projection(p, q, k) {
        let dot = (k.x - p.x) * (q.x - p.x) + (k.y - p.y) * (q.y - p.y);
        let norm = Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2);
        let t = dot / norm;
        return new Point(p.x + t * (q.x - p.x), p.y + t * (q.y - p.y));
    }


    p.draw = function () {
        p.background(122, 158, 128);
        p.text(p.textToDisplay, p.width / 2, 10);
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