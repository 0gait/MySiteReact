import { ChangeLockedCommand } from "./ChangeLockedCommand";

export class LockCommand extends ChangeLockedCommand {
    getLockState(): boolean {
        return true;
    }
}
