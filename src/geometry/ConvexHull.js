export class ConvexHull {
    constructor(points) {
        this.points = points
    }

    draw(p) {
        let n = this.points.length - 1;
        this.points.forEach((point) => point.draw(p));

        p.stroke("#7F4FF9")
        for (let i = 0; i < this.points.length - 1; i++) {
            p.line(this.points[i].x, -this.points[i].y, this.points[i + 1].x, -this.points[i + 1].y);
        }
        if (this.points.length >= 3) {
            p.line(this.points[0].x, -this.points[0].y, this.points[n].x, -this.points[n].y);
        }
    }

    get(index) {
        if (index < 0 || index >= this.points.length) {
            console.error("Index out of bounds {}", index);
            return null;
        }
        return this.points[index];
    }

    length() {
        return this.points.length;
    }
}