import { Point } from "../geometry/Point.js";
import { Polygon } from "../geometry/Polygon.js";
import { IAR } from "./IAR.js";

// const translatedPoints = getTranslatedPoints();
// const polygon = new Polygon(translatedPoints.slice(0, -1), true);
// const p_point = translatedPoints[translatedPoints.length - 1];
// const iar = new IAR(polygon, p_point);
const polygon = new Polygon([], false);
let p_point;
let operationnel = false;
let iar;

function getTranslatedPoints() {
    // Define the points
    const points = [
        new Point(1 * 80, 2 * 80),      // a
        new Point(2 * 80, -0.5 * 80),   // m
        new Point(2.5 * 80, 0.5 * 80),  // l
        new Point(4.5 * 80, 0.5 * 80),  // c
        new Point(2.5 * 80, 1.5 * 80),  // k
        new Point(5 * 80, 1 * 80),      // j
        new Point(6 * 80, 0 * 80),      // i
        new Point(6.5 * 80, 1 * 80),    // n
        new Point(5.5 * 80, 1.75 * 80), // b
        new Point(6 * 80, 2.5 * 80),    // o
        new Point(5 * 80, 2.5 * 80),    // h
        new Point(4.5 * 80, 3 * 80),    // f
        new Point(4 * 80, 2.25 * 80),   // g
        new Point(4 * 80, 1.5 * 80),    // e
        new Point(2.5 * 80, 3 * 80),    // d

        new Point(1.75 * 80, 0.4 * 80)    // p
    ];

    // Calculate the bounding box
    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const minY = Math.min(...points.map(p => p.y));
    const maxY = Math.max(...points.map(p => p.y));

    // Calculate the center of the bounding box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    // Translate points to center the figure
    return points.map(p => new Point(p.x - centerX, p.y - centerY));
}

function setupCanvas(p) {
    const canvas = p.createCanvas(600, 400);
    canvas.parent("example_IAR2"); // Attach the canvas to the specified container
    p.background(255);
    p.stroke("black");
    p.fill("black");
    p.strokeWeight(2);
    p.translate(p.width / 2, p.height / 2);
}

new p5(function(p) {

    p.setup = function () {
        setupCanvas(p);

        const button = document.getElementById("closePolygonButton");
        // Ajouter un écouteur d'événement pour le bouton de fermeture du polygone
        button.addEventListener("click", function() {
            polygon.compute();
        });
    }

    p.draw = function () {
        p.translate(p.width / 2, p.height / 2);
        p.fill("black");
        p.stroke("black");
        if (operationnel) {
            p_point.draw(p);
            iar.draw(p, true);
        }
        polygon.draw(p);
    }

    p.mousePressed = function () {
        // Ajouter un nouveau point à la liste des points
        const x = p.mouseX - p.width / 2;
        const y = p.mouseY - p.height / 2;

        const button = document.getElementById("closePolygonButton");
        const buttonRect = button.getBoundingClientRect();
        const canvasRect = p.canvas.getBoundingClientRect();

        // Check if the mouse is within the button's bounding box
        if (
            p.mouseX >= buttonRect.left - canvasRect.left &&
            p.mouseX <= buttonRect.right - canvasRect.left &&
            p.mouseY >= buttonRect.top - canvasRect.top &&
            p.mouseY <= buttonRect.bottom - canvasRect.top
        ) {
            return; // Do not add a point if the mouse is over the button
        }

        if (polygon.closed === true) {
            p_point = new Point(x, -y);
            operationnel = true;
            iar = new IAR(polygon, p_point);
            console.log(iar);
            console.log(p_point);
        } else {
            polygon.addPoint(new Point(x, -y));
        }
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    }
});