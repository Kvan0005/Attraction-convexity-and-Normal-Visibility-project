import {WalkingAnt} from "../WalkingAnt.js";
import {Dialog} from "../Dialog.js";
import {AnimatedText} from "../AnimatedText.js";
import {ReactivePolygon} from "../ReactivePolygon.js";
import {Phase} from "./Phase.js";
import {Point} from "../../Point.js";
import {Attraction} from "../../Attraction.js";

class Sketch{
    constructor() {
        this.polygon = new ReactivePolygon();
        this.phase = Phase.Draw;
        this.dialog1 = new Dialog([
                new AnimatedText("This polygon is Attraction Convex", 4000, 1000,),
                new AnimatedText("It means that every point in the polygon attracts every other point", 4000, 2000),
                new AnimatedText("Let's imagine an ant walking along the polygon in a counter-clockwise direction,\nwith a laser pointing to its right", 4500, 500)
            ]);
        this.dialog1negative = new Dialog([
            new AnimatedText("This polygon is not Attraction Convex", 4000, 1000,),
            new AnimatedText("It means that there are points that don't attract every other point", 4000, 2000),
            new AnimatedText("Let's imagine an ant walking along the polygon in a counter-clockwise direction,\nwith a laser pointing to its right", 4500, 500)
        ]);

        this.dialog2  = new Dialog([
                new AnimatedText("The laser doesn't hit the polygon.", 4000, 1000),
                new AnimatedText("Which means the polygon is Normally Visible", 3000, 1000),
                new AnimatedText("Normal visibility is another way to describe attraction convexity", 3500, 1000),
                new AnimatedText("These notions are subject of our study.", 3000, 1000),
                new AnimatedText("As well as Inverse Attraction Region of a point.", 3000, 1000),
                new AnimatedText("Which is the set of points that can attract the given point", 3000, 1000),
            ]);

        this.dialog2negative = new Dialog([
            new AnimatedText("The laser hits the polygon.", 4000, 1000),
            new AnimatedText("Which means the polygon is not Normally Visible", 3000, 1000),
            new AnimatedText("Normal visibility is another way to describe attraction convexity", 3500, 1000),
            new AnimatedText("These notions are subject of our study.", 3000, 1000),
            new AnimatedText("As well as Inverse Attraction Region of a point.", 3000, 1000),
            new AnimatedText("Which is the set of points that can attract the given point", 3000, 1000),
        ]);
        this.ant = new WalkingAnt(this.polygon);
        this.p;
        this.isAttractionConvex = null;
    }

    setP(p){
        this.p = p;
    }

    notify(obj){
        switch(this.phase) {
            case Phase.Draw: {
                this.polygon.toCounterClockwiseOrder();
                this.phase = this.phase.next();
                break;
            }
            case Phase.Explanation: {
                this.phase = this.phase.next();
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
            case Phase.Draw: {
                this.polygon.drawAnimated(this.p, this);
                break;}
            case Phase.Explanation: {
                this.polygon.draw(this.p);
                if (this.isAttractionConvex) this.dialog1.draw(this.p, this);
                else this.dialog1negative.draw(this.p, this);
                break;}
            case Phase.ImagineAnt: {
                this.ant.init(this.p);
                this.polygon.draw(this.p);
                this.ant.draw(this.p, this);
                break;}
            case Phase.EndVisible: {
                this.polygon.draw(this.p);
                this.ant.draw(this.p, this);
                if (this.isAttractionConvex) this.dialog2.draw(this.p, this);
                else this.dialog2negative.draw(this.p, this);
            }
        }
    }

    polygonIsClosed(){
        return this.polygon.isClosed();
    }


    isNearFirstVertexPolygon(p) {
        return this.polygon.isNearFirstVertex(p);
    }

    tryClosePolygon(p){
        if (this.polygon.close(p)) {
            this.isAttractionConvex = Attraction.compute(this.polygon.toPolygon());
            if (this.isAttractionConvex === false) {
                this.polygon.setColor([255, 126, 121]);
            }
        }
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
            sketch.tryClosePolygon(p)
        } else {
            sketch.addPoint(new Point(p.mouseX, -p.mouseY));
        }
    };

    p.windowResized = function () {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
}

new p5(s);