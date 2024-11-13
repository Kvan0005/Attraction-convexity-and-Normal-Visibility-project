import { Polygon } from "./Polygon.js"; // Import the Polygon class
import { Point } from "./Point.js"; // Import the Point class


var poly = new Polygon(); // Create a new Polygon object
var ch;
var clearButton;
var computeButton;

const s=(p) => {
    p.setup = function(){
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
        clearButton.mousePressed(resetpoints);
    }

    function resetpoints(){
        poly.reset();
    }

    function compute(){
        poly.compute();
        ch = poly.getConvexHull()
    }

    p.draw = function(){
        p.background(122, 158, 128);
        p.text(p.textToDisplay, p.width / 2, 10);
        poly.draw(p);
        if (ch) { ch.draw(p) }
    }

    p.mousePressed = function(){
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

    p.windowResized = function(){
        let xCompute = p.width / 2 - computeButton.width - 5;
        let xClear = p.width / 2 - clearButton.width + 5;
        let y = height - 50;
        computeButton.position(xCompute - 30, y);
        clearButton.position(xClear + 30, y);
        p.resizeCanvas(windowWidth, windowHeight);
    }
}

new p5(s); // Create a new p5.js sketch