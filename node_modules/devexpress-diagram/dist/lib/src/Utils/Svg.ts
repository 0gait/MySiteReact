import { KeySet } from "../ListUtils";

const COLOR_PROPERTIES: KeySet = { "stroke": true, "fill": true };

export function isColorProperty(propName: string) {
    return COLOR_PROPERTIES[propName];
}
