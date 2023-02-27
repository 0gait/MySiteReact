import { LayoutSettings, LogicalDirectionKind } from "../../Layout/LayoutSettings";
import { AutoLayoutTreeVerticalCommand } from "./AutoLayoutTreeVerticalCommand";

export class AutoLayoutTreeVerticalBottomToTopCommand extends AutoLayoutTreeVerticalCommand {
    createLayoutSettings(): LayoutSettings {
        const settings = super.createLayoutSettings();
        settings.direction = LogicalDirectionKind.Backward;
        return settings;
    }
}
