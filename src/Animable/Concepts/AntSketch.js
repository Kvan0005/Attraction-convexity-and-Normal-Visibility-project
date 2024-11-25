import {WalkingAnt} from "../WalkingAnt.js"
import {ReactivePolygon} from "../ReactivePolygon.js";
import {Point} from "../../Point.js";

class Sketch{
    constructor() {

        let points = [
            new Point(420, -119),
            new Point(373, -163),
            new Point(444, -226),
            new Point(433, -323),
            new Point(584, -243),
            new Point(646, -258),
            new Point(679, -152),
            new Point(568, -56),
            new Point(544, -115),
            new Point(486, -132)
        ]
        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));

        // Calculate the center of the bounding box
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        points = points.map(p => new Point(p.x - centerX, p.y - centerY));

        this.polygon = new ReactivePolygon(points, true);

        this.ant = new WalkingAnt(this.polygon, 6000, 8000);
        this.p;
    }

    setP(p){
        this.p = p;
        this.ant.init(this.p);
    }

    notify(){
        this.ant.restart();
    }

    draw(){
        this.polygon.draw(this.p);
        this.ant.draw(this.p, this);
    }
}

var sketch = new Sketch();
const s = (p) => {
    p.setup = function () {
        const parent = document.getElementById('antAnimation'); // Récupérer le parent
        const parentBounds = parent.getBoundingClientRect(); // Obtenir les dimensions du parent
        const canvas = p.createCanvas(parentBounds.width, parentBounds.height); // Taille du canvas = parent
        canvas.parent('antAnimation')
        sketch.setP(p);
        p.textSize(20);
        p.textAlign(p.CENTER, p.TOP);
        p.translate(p.width / 2, p.height / 2);
        p.frameRate(30);
    };

    p.draw = function () {
        p.translate(p.width / 2, p.height / 2);
        p.background(255, 255, 255);
        p.stroke(0, 0, 0);
        p.strokeWeight(1);
        sketch.draw();
    };

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        p.translate(p.width / 2, p.height / 2);
    };
}

new p5(s);