import { Point } from "@devexpress/utils/lib/geometry/point";
import { IAStarContext } from "./AStarContext";

export class AStarCalculator {
    static calculate<TPoint extends Point>(context: IAStarContext<TPoint>): void {
        if(context) {
            let callBack: (context: IAStarContext<TPoint>) => any = this.start(context);
            while(callBack)
                callBack = callBack(context);
        }
    }
    private static start<TPoint extends Point>(context: IAStarContext<TPoint>) {
        context.start();
        return context.shouldStartContinue ? AStarCalculator.startContinue : AStarCalculator.finishWithPath;
    }
    private static startContinue<TPoint extends Point>(context: IAStarContext<TPoint>) {
        context.startContinue();
        return context.shouldFinish ? AStarCalculator.finishWithPath : AStarCalculator.endContinue;
    }
    private static endContinue<TPoint extends Point>(context: IAStarContext<TPoint>) {
        context.endContinue();
        return context.shouldStartContinue ? AStarCalculator.startContinue : AStarCalculator.finishWithoutPath;
    }
    private static finishWithPath<TPoint extends Point>(context: IAStarContext<TPoint>) {
        context.finishWithPath();
    }
    private static finishWithoutPath<TPoint extends Point>(context: IAStarContext<TPoint>) {
        context.finishWithoutPath();
    }
}
