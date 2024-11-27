import {Point} from "../geometry/Point.js";
import {StraightLine} from "../InverseAttraction/StraightLine.js";
class PocketPolygon {
    constructor(chains){
        this.first = chains.shift();
        this.last = chains.pop();
        this.chains = chains;
        this.order = this.getFirst().x < this.getLast().x ? 1 : -1; // 1: left to right, -1: right to left and assuming general position
    }
    
    getChains(){
        return [this.first, ...this.chains, this.last];
    }

    getFirst(){
        return this.first;
    }
    
    getLast(){
        return this.last;
    }
    
    isOrderedProjection(){
        this.projectionPoints = [this.getFirst()];
        for (const element of this.chains) {
            this.projectionPoints.push(this.projection(this.getFirst(), this.getLast(), element));
        }
        this.projectionPoints.push(this.getLast);
        for (let i = 0; i < this.projectionPoints.length - 1; i++) {
            if (this.order*this.projectionPoints[i].x > this.order*this.projectionPoints[i+1].x) {
                return false;
            }
        }
        return true;
    }

    projection(p, q, k) {
        const dot = (k.x - p.x) * (q.x - p.x) + (k.y - p.y) * (q.y - p.y);
        const norm = Math.pow(q.x - p.x, 2) + Math.pow(q.y - p.y, 2);
        const t = dot / norm;
        return new Point(p.x + t * (q.x - p.x), p.y + t * (q.y - p.y));
    }

    draw(p){
        p.stroke("black");
        p.line(this.getFirst().x, -this.getFirst().y, this.getLast().x, -this.getLast().y);
        new StraightLine(this.getFirst(), this.getLast()).draw(p, "black", true);
        p.stroke("blue");
        for (let i = 0; i < this.getChains().length; i++) {
            p.line(this.getChains()[i].x, -this.getChains()[i].y, this.projectionPoints[i].x, -this.projectionPoints[i].y);
        }
        p.stroke("white");
    }
}

function generatePocketChain(poly, v_p, v_q, index_vp){ 
    let pocket_chain = [v_p];
    let index = (index_vp + 1) % poly.length();
    while (poly.get(index) !== v_q) {
        pocket_chain.push(poly.get(index));
        index = (index + 1) % poly.length();
    }
    pocket_chain.push(v_q);
    return pocket_chain;
}

export {PocketPolygon, generatePocketChain};