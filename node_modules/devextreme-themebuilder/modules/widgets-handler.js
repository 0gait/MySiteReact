"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const widgetListComment = '// public widgets';
class WidgetsHandler {
    constructor(widgets, bundlePath, dependencies) {
        const theme = bundlePath.includes('material') ? 'material' : 'generic';
        this.dependencies = dependencies || {};
        this.widgets = widgets ? widgets.map((w) => w.toLowerCase()) : [];
        this.indexPath = (0, path_1.join)((0, path_1.dirname)(bundlePath), '..', 'widgets', theme, '_index.scss');
    }
    getIndexWidgetItems(indexContent) {
        const widgetListIndex = indexContent.indexOf(widgetListComment);
        const widgetRegex = /@use "\.\/(\w+)";/g;
        const widgetsListString = indexContent.substr(widgetListIndex + widgetListComment.length);
        const result = [];
        this.baseIndexContent = indexContent.substr(0, widgetListIndex);
        let match = widgetRegex.exec(widgetsListString);
        while (match !== null) {
            result.push({ widgetName: match[1].toLowerCase(), widgetImportString: match[0] });
            match = widgetRegex.exec(widgetsListString);
        }
        return result;
    }
    getWidgetsWithDependencies() {
        return this.widgets.reduce((fullWidgetsList, widget) => {
            const notUnique = [
                ...fullWidgetsList,
                widget,
                ...this.dependencies[widget] || [],
            ];
            return [...new Set(notUnique)];
        }, []);
    }
    getWidgetLists(allWidgets) {
        const userWidgets = this.getWidgetsWithDependencies();
        const needWidgets = allWidgets.filter((w) => userWidgets.length === 0
            || userWidgets.includes(w.widgetName));
        const widgets = needWidgets.map((w) => w.widgetName);
        const widgetImports = needWidgets.map((w) => w.widgetImportString);
        const unusedWidgets = userWidgets.filter((w) => !widgets.includes(w));
        const indexContent = this.baseIndexContent + widgetImports.join('\n');
        return {
            widgets,
            unusedWidgets,
            indexContent,
        };
    }
    getIndexContent() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const initialContent = (yield fs_1.promises.readFile(this.indexPath)).toString();
                const fullWidgetList = this.getIndexWidgetItems(initialContent);
                return this.getWidgetLists(fullWidgetList);
            }
            catch (e) {
                return Promise.reject(e);
            }
        });
    }
}
exports.default = WidgetsHandler;
