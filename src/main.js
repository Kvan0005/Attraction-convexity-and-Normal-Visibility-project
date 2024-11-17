import {Polygon} from "./Polygon.js"; // Import the Polygon class
import {isRightTurn, Point} from "./Point.js"; // Import the Point class


var poly = new Polygon(); // Create a new Polygon object
var ch;
var clearButton;
var computeButton;


var temp = [];
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
        let cnt = 0;
        for (let i = 0; i < ch.length(); i++) {
            console.log(i);
            let i_1 = (i + 1) % ch.length();
            let v_p = ch.get(i);
            let v_q = ch.get(i_1);
            if (v_p === poly.get(i) && v_q === poly.get(i_1))
                continue;
            let pocket_lid = [v_p];
            let index = i_1;
            while (poly.get(index) !== v_q) {
                pocket_lid.push(poly.get(index));
                index = (index + 1) % poly.length();
                console.log(index);
            }
            pocket_lid.push(v_q);

            let prime_pocket = [v_p];
            for (let i = 1; i < pocket_lid.length; i++) {
                let p = pocket_lid[i];
                prime_pocket.push(projection(p, v_p));
            }
            if (cnt === 0) {
                console.log("adding");
                temp.push([v_p, v_q])
                for (let i = 1; i < prime_pocket.length; i++) {
                    temp.push([prime_pocket[i], pocket_lid[i]])
                }
                cnt++;
            }
        }
    }

    function ccwScan(polygon) {
        let S = [polygon.leftmostPoint()]
        for (let i = 0; i < polygon.length(); i++) {
            while (S.length !== 1 && isRightTurn(S[S.length - 2], S[S.length - 1], v_i)) { S.pop() }
        }

    }

    // WARNING: This function is not implemented correctly and is BUGGY
    function projection(p, q) {
        let factor = dot_product(p, q);
        return [factor * q.x, factor * q.y];
    }

    function dot_product(p, q) {
        return (p.x * q.x + p.y * q.y)
    }


    p.draw = function () {
        p.background(122, 158, 128);
        p.text(p.textToDisplay, p.width / 2, 10);
        poly.draw(p);
        if (ch) {
            ch.draw(p);
        }
        if (temp.length === 0) return;
        console.log(temp);
        p.stroke("black");
        p.fill("black");
        let v = temp.shift();
        console.log(v);
        p.line(v[0].x, -v[0].y, v[1].x, -v[1].y);
        p.fill("red");
        p.stroke("red");
        for (let i = 0; i < temp.length; i++) {
            p.line(temp[i][0].x, -temp[i][0].y, temp[i][1].x, -temp[i][1].y);
        }
        p.fill("white");
        p.stroke("white");
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