import { Point } from "../geometry/Point.js";
import { Polygon } from "../geometry/Polygon.js";
import { IAR } from "./IAR.js";
import { perpendicularFromTwoPoints } from "./StraightLine.js";

const translatedPoints = getTranslatedPoints();
const polygon = new Polygon(translatedPoints.slice(0, -1), true);
const p_point = translatedPoints[translatedPoints.length - 1];
const iar = new IAR(polygon, p_point);

function getTranslatedPoints() {
    // Define the points
    const points = [
        new Point(680, -375),  // a
        new Point(680, -485),  // m
        new Point(830, -590),  // l
        new Point(850, -520),  // c
        new Point(810, -480),  // k
        new Point(880, -470),  // j
        new Point(840, -620),  // i
        new Point(680, -515),  // n
        new Point(680, -650),  // b
        new Point(920, -650),  // o
        new Point(900, -600),  // h
        new Point(940, -650),  // f
        new Point(1065, -650), // g
        new Point(950, -405),  // e
        new Point(1065, -405), // d
        new Point(1065, -380),  // p
        
        new Point(1040, -392.5)    // p
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

function setupCanvas(p, containerId) {
    const canvas = p.createCanvas(600, 400);
    canvas.parent(containerId); // Attach the canvas to the specified container
    p.background(255);
    p.stroke("black");
    p.fill("black");
    p.strokeWeight(2);
    p.translate(p.width / 2, p.height / 2);
}

function drawSketch(p, drawFunction) {
    p.background(255);
    p.stroke("black");
    p.fill("black");
    p.strokeWeight(2);
    p.translate(p.width / 2, p.height / 2);
    drawFunction(p);
    p.noLoop();
}

const sketches = [
    { containerId: 'example_IAR', drawFunction: (p) => iar.draw(p) },
    { containerId: 'example_IAR2', drawFunction: (p) => iar.draw(p) },
    { containerId: 'example_Ri', drawFunction: (p) => iar.drawRi(p) },
    { containerId: 'example_H1_H2', drawFunction: (p) => iar.drawH1(p) },
    { containerId: 'example_H1_H2_2', drawFunction: (p) => iar.drawH2(p) },
    { containerId: 'example_Freei', drawFunction: (p) => iar.drawFreei(p) },
    { containerId: 'example_Freei2', drawFunction: (p) => iar.drawFreei2(p) },
    { containerId: 'example_constraining', drawFunction: (p) => example_constraining(p) }
];

sketches.forEach(({ containerId, drawFunction }) => {
    new p5((p) => {
        p.setup = function () {
            setupCanvas(p, containerId);
        };

        p.draw = function () {
            drawSketch(p, drawFunction);
        };

        p.windowResized = function () {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            p.translate(p.width / 2, p.height / 2);
        };
    });
});

function example_constraining(p) {
    p.fill("red");
    p.stroke("red");
    let p_point = new Point(75, 50);
    let e = [new Point(-25, 75), new Point(75, -75)];
    let h = perpendicularFromTwoPoints(e[0], e[1], e[0]);

    let x = new Point(-225, 40);
    let y = new Point(-125, -90);

    p_point.draw(p);
    p.stroke("black");
    p.fill("black");
    p.line(e[0].x, -e[0].y, e[1].x, -e[1].y);
    h.draw(p, "blue", true);
    e[0].draw(p);

    p.stroke(0, 0, 0, 50); // Set transparency to 50 out of 255
    p.line(e[0].x, -e[0].y, 0, 75);
    p.stroke("black"); // Reset stroke color to black

    p.stroke("green");
    p.fill("green");
    x.draw(p);

    p.stroke("red")
    p.fill("red");
    y.draw(p);

    p.textFont("Georgia", 15);
    p.noStroke();
    p.fill("black");
    p.text(`p`, p_point.x + 5, -p_point.y - 5);
    p.text(`x`, x.x - 10, -x.y - 5);
    p.text(`y`, y.x - 10, -y.y - 5);
    p.text(`e`, (e[0].x + e[1].x) / 2 + 5, -(e[0].y + e[1].y) / 2 + 40);
    p.text(`H`, (x.x + y.x) / 2 - 50, -(x.y + y.y) / 2 + 20);
    p.text(`v`, e[0].x + 5, -e[0].y - 15);
}