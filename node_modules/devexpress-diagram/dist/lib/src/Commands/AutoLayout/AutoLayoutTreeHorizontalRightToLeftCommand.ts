import { LayoutSettings, LogicalDirectionKind } from "../../Layout/LayoutSettings";
import { AutoLayoutTreeHorizontalCommand } from "./AutoLayoutTreeHorizontalCommand";

export class AutoLayoutTreeHorizontalRightToLeftCommand extends AutoLayoutTreeHorizontalCommand {
    createLayoutSettings(): LayoutSettings {
        const settings = super.createLayoutSettings();
        settings.direction = LogicalDirectionKind.Backward;
        return settings;
    }
}
