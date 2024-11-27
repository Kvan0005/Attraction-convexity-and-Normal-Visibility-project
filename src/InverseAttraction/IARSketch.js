import {WalkingAnt} from "../Animable/WalkingAnt.js";
import {Dialog} from "../Animable/Dialog.js";
import {AnimatedText} from "../Animable/AnimatedText.js";
import {ReactivePolygon} from "../Animable/ReactivePolygon.js";
import {Phase} from "./Phase.js";
import {Point} from "../Point.js";
import { IAR } from "./IAR.js";

class Sketch{
    constructor() {
        this.polygon = new ReactivePolygon();
        this.attractedPoint = undefined;
        this.iar;
        this.phase = Phase.DrawPolygon;
        this.p;
        // this.dialog1 = new Dialog([
        //         new AnimatedText("This polygon is Attraction Convex", 4000, 1000,),
        //         new AnimatedText("It means that every point in the polygon attracts every other point", 4000, 2000),
        //         new AnimatedText("Let's imagine an ant walking along the polygon in a counter-clockwise direction,\nwith a laser pointing to its right", 4500, 500)
        //     ]);
        // this.dialog1negative = new Dialog([
        //     new AnimatedText("This polygon is not Attraction Convex", 4000, 1000,),
        //     new AnimatedText("It means that there are points that don't attract every other point", 4000, 2000),
        //     new AnimatedText("Let's imagine an ant walking along the polygon in a counter-clockwise direction,\nwith a laser pointing to its right", 4500, 500)
        // ]);

        // this.dialog2  = new Dialog([
        //         new AnimatedText("The laser doesn't hit the polygon.", 4000, 1000),
        //         new AnimatedText("Which means the polygon is Normally Visible", 3000, 1000),
        //         new AnimatedText("Normal visibility is another way to describe attraction convexity", 3500, 1000),
        //         new AnimatedText("These notions are subject of our study.", 3000, 1000),
        //         new AnimatedText("As well as Inverse Attraction Region of a point.", 3000, 1000),
        //         new AnimatedText("Which is the set of points that can attract the given point", 3000, 1000),
        //     ]);

        // this.dialog2negative = new Dialog([
        //     new AnimatedText("The laser hits the polygon.", 4000, 1000),
        //     new AnimatedText("Which means the polygon is not Normally Visible", 3000, 1000),
        //     new AnimatedText("Normal visibility is another way to describe attraction convexity", 3500, 1000),
        //     new AnimatedText("These notions are subject of our study.", 3000, 1000),
        //     new AnimatedText("As well as Inverse Attraction Region of a point.", 3000, 1000),
        //     new AnimatedText("Which is the set of points that can attract the given point", 3000, 1000),
        // ]);
        // this.ant = new WalkingAnt(this.polygon);
    }

    setP(p){
        this.p = p;
    }

    notify(obj){
        switch(this.phase) {
            case Phase.DrawPolygon: {
                this.phase = this.phase.next(); break;
            }
            case Phase.DrawPoint: {
                this.phase = this.phase.next(); break;
            }
            case Phase.ComputeIAR: {
                this.phase = this.phase.next(); break;
            }
            case Phase.DrawAttraction: {
                this.phase = this.phase.next();
                console.log("ended")
                this.p.noLoop();
            }
        }
    }

    draw(){
        switch (this.phase) {
            case Phase.DrawPolygon: {
                this.polygon.drawAnimated(this.p, this); 
                break;}
            case Phase.DrawPoint: {
                this.polygon.draw(this.p);
                this.polygon.toCounterClockwiseOrder();
                break;}
            case Phase.ComputeIAR: {
                this.constuctIAR();
                this.phase = this.phase.next();
            } case Phase.DrawAttraction: {
                this.polygon.draw(this.p);
                this.attractedPoint.draw(this.p);
                this.iar.draw(this.p);
                break;
            }
        }
    }

    polygonIsClosed(){
        return this.polygon.isClosed();
    }

    attractedPointIsSet(){
        return this.attractedPoint !== undefined;
    }

    isNearFirstVertexPolygon(p) {
        return this.polygon.isNearFirstVertex(p);
    }

    closePolygon(p){
        this.polygon.close(p);
    }

    addPoint(point){
        if (this.polygon.isClosed()) {   
            this.attractedPoint = point;
        } else {
            this.polygon.add(point);
        }
    }

    constuctIAR(){
        this.iar = new IAR(this.polygon.toPolygon(), this.attractedPoint);
    }
}

var sketch = new Sketch();
const s = (p) => {
    p.setup = function () {
        const parent = document.getElementById('animationCanvasContainer'); // Récupérer le parent
        const parentBounds = parent.getBoundingClientRect(); // Obtenir les dimensions du parent
        const canvas = p.createCanvas(parentBounds.width, parentBounds.height); // Taille du canvas = parent
        canvas.parent('animationCanvasContainer')
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

        if (sketch.attractedPointIsSet()) {
            return;
        } else if (sketch.polygonIsClosed()) {
            sketch.addPoint(new Point(p.mouseX, -p.mouseY));
            sketch.notify();
            return;
        }

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