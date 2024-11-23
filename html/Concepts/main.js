import { Point } from "../../src/Point.js";
import { Polygon } from "../../src/Polygon.js";
import { SPT } from "../../src/SPT.js";


const translatedPoints = getTranslatedPoints();
const polygon = new Polygon(translatedPoints.slice(0, -1), true);
const p_point = translatedPoints[translatedPoints.length - 1];
const spt = new SPT(polygon, p_point);

function getTranslatedPoints() {
    // Define the points
    const points = [
        new Point(1 * 80, 2 * 80),      // a
        new Point(2.5 * 80, 3 * 80),    // d
        new Point(4 * 80, 1.5 * 80),    // e
        new Point(4 * 80, 2.25 * 80),   // g
        new Point(4.5 * 80, 3 * 80),    // f
        new Point(5 * 80, 2.5 * 80),    // h
        new Point(6 * 80, 2.5 * 80),    // o
        new Point(5.5 * 80, 1.75 * 80), // b
        new Point(6.5 * 80, 1 * 80),    // n
        new Point(6 * 80, 0 * 80),      // i
        new Point(5 * 80, 1 * 80),      // j
        new Point(2.5 * 80, 1.5 * 80),  // k
        new Point(4.5 * 80, 0.5 * 80),  // c
        new Point(2.5 * 80, 0.5 * 80),  // l
        new Point(2 * 80, -0.5 * 80),   // m

        new Point(2 * 80, 0.25 * 80)    // p
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

const s = (p) => {
    p.setup = function () {
        const canvas = p.createCanvas(600, 400);
        canvas.parent('animationCanvasContainer'); // Attach the canvas to the specified container
        p.background(255);
        p.stroke("black");
        p.fill("black");
        p.strokeWeight(2);
        p.translate(p.width / 2, p.height / 2);
    }

    p.draw = function () {
        p.background(255);
        p.stroke("black");
        p.fill("black");
        p.strokeWeight(2);
        p.translate(p.width / 2, p.height / 2);
        p_point.draw(p);
        polygon.draw(p);
        spt.draw(p);
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    }
};

new p5(s); // Create a new p5.js sketch