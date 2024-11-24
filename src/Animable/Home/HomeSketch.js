import {WalkingAnt} from "../WalkingAnt.js";
import {Dialog} from "../Dialog.js";
import {AnimatedText} from "../AnimatedText.js";
import {ReactivePolygon} from "../ReactivePolygon.js";
import {Phase} from "./Phase.js";

export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(p, size) {
        if (size === undefined) size = 5;
        p.ellipse(this.x, -this.y, size, size);
    }
}


class Sketch{
    constructor() {
        this.polygon = new ReactivePolygon();
        this.phase = Phase.Draw;
        this.dialog1 = new Dialog([
                new AnimatedText("This polygon is Attraction Convex", 3000, 1000,),
                new AnimatedText("It means that every point of the polygon can attract every others one", 3000, 1000),
                new AnimatedText("", 500),
                new AnimatedText("Now, let's imagine an ant walking counterclockwise\nwith a laser on its right on the edges...", 4000, 500)
            ]);

        this.dialog2  = new Dialog([
                new AnimatedText("The laser doesn't hit the polygon.", 3000, 1000,),
                new AnimatedText("Which means the polygon is Normally Visible", 3000, 1000),
                new AnimatedText("Normal visibility is another way to describe attraction convexity", 5000, 1000),
                new AnimatedText("These Notions are subject of our study.", 3000, 1000)
            ]);
        this.ant = new WalkingAnt(this.polygon);
        this.p;
    }

    setP(p){
        this.p = p;
    }

    notify(obj){
        switch(this.phase) {
            case Phase.Draw: {
                this.phase = this.phase.next(); break;
            }
            case Phase.Explanation: {
                this.phase = this.phase.next();
                this.polygon.toCounterClockwiseOrder();
                break;
            }
            case Phase.ImagineAnt: {
                this.phase = this.phase.next(); this.ant.restart(); break;
            }
            case Phase.EndVisible: {
                if (obj !== undefined) return;
                console.log("ended")
                this.p.noLoop();
            }
        }
    }

    draw(){
        switch (this.phase) {
            case Phase.Draw: {this.polygon.drawAnimated(this.p, this); break;}
            case Phase.Explanation: {
                //isAttractionConvex = Attraction.compute(polygon.toPolygon())
                this.polygon.draw(this.p);
                this.dialog1.draw(this.p, this);
                break;}
            case Phase.ImagineAnt: {
                this.ant.init(this.p);
                this.polygon.draw(this.p);
                this.ant.draw(this.p, this);
                break;}
            case Phase.EndVisible: {
                this.polygon.draw(this.p);
                this.ant.draw(this.p, this);
                this.dialog2.draw(this.p, this);
            }
        }
    }

    polygonIsClosed(){
        return this.polygon.isClosed();
    }


    isNearFirstVertexPolygon(p) {
        return this.polygon.isNearFirstVertex(p);
    }

    closePolygon(p){
        this.polygon.close(p);
    }

    addPoint(point){
        this.polygon.add(point);
    }
}

var sketch = new Sketch();
const s = (p) => {
    p.setup = function () {
        const parent = document.getElementById('bigAnimationCanvasContainer'); // Récupérer le parent
        const parentBounds = parent.getBoundingClientRect(); // Obtenir les dimensions du parent
        const canvas = p.createCanvas(parentBounds.width, parentBounds.height); // Taille du canvas = parent
        canvas.parent('bigAnimationCanvasContainer')
        sketch.setP(p);
        p.textSize(20);
        p.textAlign(p.CENTER, p.TOP);
    };

    p.draw = function () {
        p.background(255, 255, 255);
        p.stroke(0, 0, 0);
        p.strokeWeight(1);
        sketch.draw();
    };

    p.mousePressed = function () {
        const rect = p.canvas.getBoundingClientRect();
        if (!(
            p.mouseX >= 0 &&
            p.mouseX <= rect.width &&
            p.mouseY >= 0 &&
            p.mouseY <= rect.height)
        ) return;

        if (sketch.polygonIsClosed())
            return;

        if (sketch.isNearFirstVertexPolygon(p)) {
            p.redraw();
            sketch.closePolygon(p)
        } else {
            sketch.addPoint(new Point(p.mouseX, -p.mouseY));
        }
    };

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
}

new p5(s);