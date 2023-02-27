import { ChangeLockedCommand } from "./ChangeLockedCommand";

export class UnLockCommand extends ChangeLockedCommand {
    getLockState(): boolean {
        return false;
    }
}
