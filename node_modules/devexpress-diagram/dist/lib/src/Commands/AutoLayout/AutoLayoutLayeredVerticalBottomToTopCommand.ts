import { LayoutSettings, LogicalDirectionKind } from "../../Layout/LayoutSettings";
import { AutoLayoutLayeredVerticalCommand } from "./AutoLayoutLayeredVerticalCommand";

export class AutoLayoutLayeredVerticalBottomToTopCommand extends AutoLayoutLayeredVerticalCommand {
    createLayoutSettings(): LayoutSettings {
        const settings = super.createLayoutSettings();
        settings.direction = LogicalDirectionKind.Backward;
        return settings;
    }
}
