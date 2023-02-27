export class PredefinedStyles {
    public static fontFamilies: Array<string> = ["helvetica", "times", "courier"];
    public static fontStyles: Array<string> = ["normal", "bold", "italic", "bolditalic"];
    public static headerFooterVisibility: Array<string> = ["everyPage", "firstPage", "never" ];
    public static horizontalAlign: Array<string> = ["left", "center", "right"];
    public static overflow: Array<string> = ["linebreak", "ellipsize", "visible", "hidden"];
    public static pageBreak: Array<string> = ["auto", "avoid", "always"];
    public static rowPageBreak: Array<string> = ["auto", "avoid"];
    public static verticalAlign: Array<string> = ["top", "middle", "bottom"];
    public static width: Array<string> = ["auto", "wrap"];

    public static getPredefinedStringOrUndefined(value: string, predefined: Array<string>): string {
        const valueToCheck = value && predefined && value.toLowerCase() || undefined;
        return valueToCheck && (predefined.filter(f => f.toLowerCase() === valueToCheck)[0] || predefined.filter(f => valueToCheck.indexOf(f.toLowerCase()) > -1)[0]);
    }
}

