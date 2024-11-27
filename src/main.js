import { Point} from "./Point.js"; // Import the Point class
import { ReactivePolygon } from "./Animable/ReactivePolygon.js";
import { Phase } from "./Animable/Home/Phase.js";
import { Attraction } from "./Attraction.js";
var canvas;
var buttonList = [];
class Sketch{
    constructor() {
        this.polygon = new ReactivePolygon();
        this.phase = Phase.Draw;
        this.p;
        this.isAttractionConvex = null;
        this.show_convex_hull = false;
        this.data_pocket_chain_on_lid = [];
        this.convex_hull = null;
        this.show_projection = false;
        this.text_to_display = "?";
    }

    setP(p){
        this.p = p;
    }
    notify(obj){
        if (this.phase === Phase.Draw){
                this.polygon.toCounterClockwiseOrder();
                this.phase = this.phase.next();
            }
        }

    draw(){
        switch (this.phase) {
            case Phase.Draw: {
                this.polygon.drawAnimated(this.p, this);
                break;}
            case Phase.Explanation: {
                this.p.text(this.text_to_display, this.p.width / 2, 10);
                this.polygon.draw(this.p);
                this.text_to_display = this.isAttractionConvex ? "True" : "False";
                if (this.show_convex_hull===true && this.convex_hull !== null ) this.convex_hull.draw(this.p);
                if (this.show_projection && this.data_pocket_chain_on_lid.length > 0) this.data_pocket_chain_on_lid.forEach(elem => elem.draw(this.p));
                break;}
        }
    }

    polygonIsClosed(){
        return this.polygon.isClosed();
    }

    isNearFirstVertexPolygon() {
        return this.polygon.isNearFirstVertex(this.p);
    }

    tryClosePolygon(){
        if (this.polygon.close(this.p)) {
            this.isAttractionConvex = Attraction.compute(this.polygon.toPolygon(), true);
            this.convex_hull = this.polygon.getConvexHull();
            this.data_pocket_chain_on_lid = Attraction.projection;
            if (this.isAttractionConvex === false) {
                this.polygon.setColor([255, 126, 121]);
            }
        }
    }
    addPoint(point){
        this.polygon.add(point);
    }


    toggleShowConvexHull(){
        this.show_convex_hull = !this.show_convex_hull;
    }

    toggleShowProjection(){
        this.show_projection = !this.show_projection;
    }

    reset(){
        this.polygon = new ReactivePolygon();
        this.data_pocket_chain_on_lid = [];
        this.convex_hull = null;
        this.show_convex_hull = false;
        this.phase = Phase.Draw;
        this.isAttractionConvex = null;
        this.text_to_display = "?";
        this.show_projection = false;
    }
}

let sketch;

const s = (p) => {
    p.setup = function () {
        const parent = document.getElementById('toolContainer'); // Récupérer le parent
        const parentBounds = parent.getBoundingClientRect(); // Obtenir les dimensions du parent
        canvas = p.createCanvas(parentBounds.width, parentBounds.height); // Taille du canvas = parent
        canvas.parent('toolContainer');
        sketch = new Sketch();
        sketch.setP(p);
        p.fill("white");
        p.stroke("white");
        p.textSize(40);
        p.textAlign(p.CENTER, p.TOP);
        let height = p.height + 50;
        buttonList.push(generateButton(p.width / 2 + 185, height , "Show convex hull", () => sketch.toggleShowConvexHull(), p));
        buttonList.push(generateButton(p.width / 2 + 185, height , "Show projection", () => sketch.toggleShowProjection(), p));
        buttonList.push(generateButton(p.width / 2 + 255, height , "Clear", reset_points, p));
        let width = p.width / 2 + 80;
        buttonList.forEach(element => {
            //place the button (element) to the right of the prevous one
            element.position(width, height);
            width += element.width +40;
        });
    }

    function generateButton(x, y, text, callback, p) {
        let button = p.createButton(text);
        button.width = text.length *5;
        button.position(x, y);
        button.mousePressed(callback);
        return button;
    }


    function reset_points() {
        sketch.reset();
    }

    p.draw = function () {
        p.background(233, 230, 235);
        p.stroke("black");
        sketch.draw();
    }

    p.mousePressed = function (event) {
        if (event.target === canvas.elt){ // we need to be in the canvas to draw not buttons or other elements
            if (sketch.polygonIsClosed())
                return;
    
            if (sketch.isNearFirstVertexPolygon()) {
                p.redraw();
                sketch.tryClosePolygon()
            } else {
                sketch.addPoint(new Point(p.mouseX, -p.mouseY));
            }
        }

        
    }

    p.windowResized = function () {
        let height = p.height - 100;
        let width = p.width / 2 -30;
        buttonList.forEach(element => {
            //place the button (element) to the right of the prevous one
            element.position(width, height);
            width += element.width +40;
        });
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    }
}

new p5(s); // Create a new p5.js sketch