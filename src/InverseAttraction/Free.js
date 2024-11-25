export class Free {
    constructor(subPolygons, associatedLine) {
        this.subPolygons = subPolygons;
        this.associatedLines = associatedLines;
    }

    computeIntersection() {
        const intersection = [];
        for (let i = 0; i < this.subPolygons.length; i++) {
            const hp1 = this.associatedLine[i];
            const spi = this.subPolygons[i];
            for (let j = 0; j < this.associatedLines.length; j++) {
                if (i === j) continue;
                const hp2 = this.associatedLines[j];
                const spj = this.subPolygons[j];
                const intersectionPoint = hp1[0].getIntersectionPoint(hp2[0]);
                if (spi.isInside(intersectionPoint) && spj.isInside(intersectionPoint)) {

                    intersection.push([intersectionPoint, hp1[1], hp2[1]]);
                }
            }
        }
        return intersection;
    }


}