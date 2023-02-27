export class ImportUtils {
    static parseJSON(json) {
        if(!json || json === "")
            return {};

        try {
            return JSON.parse(json);
        }
        catch{
            return {};
        }
    }
    static createDocument(xml: string) {
        const parser = new DOMParser();
        return parser.parseFromString(xml, "application/xml");
    }
}
