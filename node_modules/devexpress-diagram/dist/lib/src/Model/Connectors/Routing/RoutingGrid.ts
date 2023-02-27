import { Point } from "@devexpress/utils/lib/geometry/point";
import { Rectangle } from "@devexpress/utils/lib/geometry/rectangle";
import { SearchUtils } from "@devexpress/utils/lib/utils/search";

export class RoutingGrid<TPoint extends Point> {
    static create<TPoint extends Point>(points: TPoint[], boundsSet: Rectangle[], createPoint: (x: number, y: number) => TPoint): RoutingGrid<TPoint> {
        const verticalLines : number[] = [];
        const horizontalLines : number[] = [];
        const varticalHashMap: { [key: number]: boolean } = {};
        const horizontalHashMap: { [key: number]: boolean } = {};
        boundsSet.forEach(x => {
            this.addLine(x.x, verticalLines, varticalHashMap);
            this.addLine(x.right, verticalLines, varticalHashMap);
            this.addLine(x.y, horizontalLines, horizontalHashMap);
            this.addLine(x.bottom, horizontalLines, horizontalHashMap);
        });
        points.forEach(p => {
            this.addLine(p.x, verticalLines, varticalHashMap);
            this.addLine(p.y, horizontalLines, horizontalHashMap);
        });
        verticalLines.sort((a, b) => { return a - b; });
        horizontalLines.sort((a, b) => { return a - b; });
        return new RoutingGrid(verticalLines, horizontalLines, createPoint);
    }
    private static addLine(line: number, lines: number[], hashMap: { [key: number]: boolean }) {
        if(!hashMap[line]) {
            lines.push(line);
            hashMap[line] = true;
        }
    }

    constructor(
        readonly verticalGridLines: number[],
        readonly horizontalGridLines: number[],
        readonly createPoint: (x: number, y: number) => TPoint) {
    }

    getNeighborPoints(point: TPoint): TPoint[] {
        const result: TPoint[] = [];
        if(!this.horizontalGridLines || !this.horizontalGridLines.length ||
            !this.verticalGridLines || !this.verticalGridLines.length)
            return result;
        let verticalIndex = SearchUtils.binaryIndexOf(this.verticalGridLines, x => x - point.x);
        if(verticalIndex < 0) {
            verticalIndex = ~verticalIndex;
            if(this.isValidArrayIndex(this.verticalGridLines, verticalIndex))
                result.push(this.createPoint(this.verticalGridLines[verticalIndex], point.y));
        }
        else if(this.isValidArrayIndex(this.verticalGridLines, verticalIndex + 1))
            result.push(this.createPoint(this.verticalGridLines[verticalIndex + 1], point.y));
        if(this.isValidArrayIndex(this.verticalGridLines, verticalIndex - 1))
            result.push(this.createPoint(this.verticalGridLines[verticalIndex - 1], point.y));

        let horizontalIndex = SearchUtils.binaryIndexOf(this.horizontalGridLines, y => y - point.y);
        if(horizontalIndex < 0) {
            horizontalIndex = ~horizontalIndex;
            if(this.isValidArrayIndex(this.horizontalGridLines, horizontalIndex))
                result.push(this.createPoint(point.x, this.horizontalGridLines[horizontalIndex]));
        }
        else if(this.isValidArrayIndex(this.horizontalGridLines, horizontalIndex + 1))
            result.push(this.createPoint(point.x, this.horizontalGridLines[horizontalIndex + 1]));
        if(this.isValidArrayIndex(this.horizontalGridLines, horizontalIndex - 1))
            result.push(this.createPoint(point.x, this.horizontalGridLines[horizontalIndex - 1]));
        return result;
    }
    private isValidArrayIndex(array: number[], index: number): boolean {
        return array && index >= 0 && index < array.length;
    }
}
