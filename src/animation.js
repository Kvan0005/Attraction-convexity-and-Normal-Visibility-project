class Phase {
    static Imagine = new Phase('Imagine');
    static AddBeacon = new Phase('AddBeacon');
    static AttractPoint = new Phase('AttractPoint');
    static EndAttract = new Phase('EndAttract');
    static Imagine2 = new Phase('Imagine2');
    static ImagineAnt = new Phase('ImagineAnt');
    static WalkAnt = new Phase('WalkAnt');
    static EndVisible = new Phase('EndVisible');

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `Direction.${this.name}`;
    }
}


let vertices = []; // Sommets du polygone
let progress = 0;  // Progression (de 0 à 1)
let step = 0.005;   // Vitesse de progression

const s = (p) => {
    p.setup = function () {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.fillColor = p.color(240);
        // Exemple d'un hexagone
        let sides = 6;
        let radius = 100;
        for (let i = 0; i < sides; i++) {
            let angle = 2*Math.PI* i / sides;
            let x = p.width / 2 + Math.cos(angle) * radius;
            let y = p.height / 2 + Math.sin(angle) * radius;
            vertices.push(p.createVector(x, y));
        }
        vertices.push(vertices[0]);
    }

    p.draw = function () {
        p.background(240);
        p.fill(p.fillColor);
        p.stroke(0);
        p.strokeWeight(2);

        p.beginShape();
        let totalSegments = vertices.length - 1; // Nombre total de segments
        let currentSegment = Math.floor(progress * totalSegments);
        let t = progress * totalSegments - currentSegment; // Fraction pour interpoler

        // Dessiner les segments entièrement parcourus
        for (let i = 0; i <= currentSegment; i++) {
            p.vertex(vertices[i].x, vertices[i].y);
        }

        // Ajouter un point intermédiaire pour le segment en cours
        if (currentSegment < totalSegments) {
            let start = vertices[currentSegment];
            let end = vertices[currentSegment + 1];
            let x = p.lerp(start.x, end.x, t);
            let y = p.lerp(start.y, end.y, t);
            p.vertex(x, y);
        }

        p.endShape();

        // Progression
        progress += step;
        if (progress > 1 + step) {
            p.ellipse(p.width / 2, p.height / 2, 4, 4);
            p.fillColor = p.color(255, 255, 255);
            p.noLoop();
            progress = 0; // Réinitialiser pour recommencer
        }
        //p.background(122, 158, 128);
        //p.text(text_to_display, p.width / 2, 10);
    }

    p.mousePressed = function () {
        progress = 0;
        p.loop();
    }

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }
}

new p5(s); // Create a new p5.js sketch