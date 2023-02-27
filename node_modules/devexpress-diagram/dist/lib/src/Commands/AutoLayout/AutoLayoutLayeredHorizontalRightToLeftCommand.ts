import { LayoutSettings, LogicalDirectionKind } from "../../Layout/LayoutSettings";
import { AutoLayoutLayeredHorizontalCommand } from "./AutoLayoutLayeredHorizontalCommand";

export class AutoLayoutLayeredHorizontalRightToLeftCommand extends AutoLayoutLayeredHorizontalCommand {
    createLayoutSettings(): LayoutSettings {
        const settings = super.createLayoutSettings();
        settings.direction = LogicalDirectionKind.Backward;
        return settings;
    }
}
