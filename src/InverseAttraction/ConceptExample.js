import { Point } from "../geometry/Point.js";
import { Polygon } from "../geometry/Polygon.js";
import { IAR } from "./IAR.js";

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

const r = (p) => {
    p.setup = function () {
        const canvas = p.createCanvas(600, 400);
        canvas.parent('example_IAR'); // Attach the canvas to the specified container
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
        iar.draw(p);
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    }
};

const s = (p) => {
    p.setup = function () {
        const canvas = p.createCanvas(600, 400);
        canvas.parent('example_Ri'); // Attach the canvas to the specified container
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
        iar.drawRi(p);
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    }
};


const t = (p) => {
    p.setup = function () {
        const canvas = p.createCanvas(600, 400);
        canvas.parent('example_H1_H2'); // Attach the canvas to the specified container
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
        iar.drawH1(p);
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    }
}

const u = (p) => {
    p.setup = function () {
        const canvas = p.createCanvas(600, 400);
        canvas.parent('example_H1_H2_2'); // Attach the canvas to the specified container
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
        iar.drawH2(p);
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    }
}

const v = (p) => {
    p.setup = function () {
        const canvas = p.createCanvas(600, 400);
        canvas.parent('example_Freei'); // Attach the canvas to the specified container
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
        iar.drawFreei(p);
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    }
}

const w = (p) => {
    p.setup = function () {
        const canvas = p.createCanvas(600, 400);
        canvas.parent('example_Freei2'); // Attach the canvas to the specified container
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
        iar.drawFreei2(p);
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    }
}


new p5(r); // Create a new p5.js sketch
new p5(s); // Create a new p5.js sketch
new p5(t); // Create a new p5.js sketch
new p5(u); // Create a new p5.js sketch
new p5(v); // Create a new p5.js sketch
new p5(w); // Create a new p5.js sketch