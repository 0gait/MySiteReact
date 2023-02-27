
export class MainElementsRender {

    createMainElement(parent: HTMLElement): HTMLElement {
        const mainElement = document.createElement("DIV");
        mainElement.style.width = parent.offsetWidth + "px";
        mainElement.style.height = parent.offsetHeight + "px";
        return mainElement;
    }

    createHeader(): HTMLElement {
        const header = document.createElement("DIV");
        header.className = "dx-gantt-header";
        return header;
    }
}
