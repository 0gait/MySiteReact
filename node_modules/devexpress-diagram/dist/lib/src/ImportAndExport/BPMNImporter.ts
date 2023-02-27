import { Graph } from "../Layout/Graph";
import { ShapeTypes } from "../Model/Shapes/ShapeTypes";
import { ItemKey } from "../Model/DiagramItem";
import { Edge } from "../Layout/Structures";
import { IImportNodeItem, IImportEdgeItem } from "../Data/Interfaces";
import { ImportUtils } from "./ImportUtils";

export class BPMNImporter {
    protected doc: Document;
    protected graph: Graph<BPMNNode>;
    protected dataSourceKey: ItemKey;

    constructor(xml: string) {
        this.doc = ImportUtils.createDocument(xml);
        this.graph = new Graph<BPMNNode>([], []);
    }

    import(): Graph<BPMNNode> {
        for(let child: Element, i = 0; child = this.doc.children[i]; i++)
            if(child.nodeName.toUpperCase() === "DEFINITIONS")
                this.onDefinitionsElement(child);

        this.validate();
        return this.graph;
    }
    private validate() {
        const nodesMap = {};
        this.graph.nodes.forEach(n => nodesMap[n] = true);
        for(let i = 0, edge: Edge; edge = this.graph.edges[i]; i++)
            if(!nodesMap[edge.from] || !nodesMap[edge.to]) {
                this.graph.edges.splice(i, 1);
                i--;
            }

    }
    private onDefinitionsElement(element: Element) {
        this.dataSourceKey = element.getAttribute("id");
        for(let child: Element, i = 0; child = element.children[i]; i++)
            if(child.nodeName.toUpperCase() === "PROCESS")
                this.onProcessElement(child);

    }
    private onProcessElement(element: Element) {
        for(let child: Element, i = 0; child = element.children[i]; i++)
            switch(child.nodeName.toUpperCase()) {
                case "STARTEVENT":
                    this.onStartEventElement(child);
                    break;
                case "SEQUENCEFLOW":
                    this.onSequenceFlowElement(child);
                    break;
                case "SCRIPTTASK":
                    this.onScriptTaskElement(child);
                    break;
                case "USERTASK":
                    this.onUserTaskElement(child);
                    break;
                case "SERVICETASK":
                    this.onServiceTaskElement(child);
                    break;
                case "SENDTASK":
                    this.onSendTaskElement(child);
                    break;
                case "EXCLUSIVEGATEWAY":
                    this.onExclusiveGateway(child);
                    break;
                case "ENDEVENT":
                    this.onEndEventGateway(child);
                    break;
            }

    }
    private onStartEventElement(element: Element) {
        const node = this.createNode(element);
        node.type = ShapeTypes.Ellipse;
        node.text = element.getAttribute("name");
        this.graph.addNode(node);
    }
    private onSequenceFlowElement(element: Element) {
        const fromKey = element.getAttribute("sourceRef");
        const toKey = element.getAttribute("targetRef");
        const edge = this.createEdge(element, fromKey, toKey);
        if(element.hasAttribute("name"))
            edge.text = element.getAttribute("name");
        this.graph.addEdge(edge);
    }
    private onScriptTaskElement(element: Element) {
        const node = this.createNode(element);
        node.text = element.getAttribute("name");
        this.graph.addNode(node);
    }
    private onUserTaskElement(element: Element) {
        const node = this.createNode(element);
        node.text = element.getAttribute("name");
        this.graph.addNode(node);
    }
    private onServiceTaskElement(element: Element) {
        const node = this.createNode(element);
        node.text = element.getAttribute("name");
        this.graph.addNode(node);
    }
    private onSendTaskElement(element: Element) {
        const node = this.createNode(element);
        node.text = element.getAttribute("name");
        this.graph.addNode(node);
    }
    private onExclusiveGateway(element: Element) {
        const node = this.createNode(element);
        node.text = element.getAttribute("name");
        node.type = ShapeTypes.Decision;
        this.graph.addNode(node);
    }
    private onEndEventGateway(element: Element) {
        const node = this.createNode(element);
        node.text = element.getAttribute("name");
        node.type = ShapeTypes.Ellipse;
        this.graph.addNode(node);
    }

    private createNode(element: Element) {
        return new BPMNNode(this.dataSourceKey, element.getAttribute("id"));
    }
    private createEdge(element: Element, fromKey: ItemKey, toKey: ItemKey): BPMNEdge {
        return new BPMNEdge(this.dataSourceKey, element.getAttribute("id"), fromKey, toKey);
    }
}

export class BPMNNode implements IImportNodeItem {
    type: string = ShapeTypes.Rectangle;
    text: string;
    constructor(
        public sourceKey: ItemKey,
        public key: ItemKey
    ) { }
}

class BPMNEdge extends Edge implements IImportEdgeItem {
    text: string;
    constructor(
        public sourceKey: ItemKey,
        key: ItemKey,
        fromKey: ItemKey,
        toKey: ItemKey
    ) {
        super(key, fromKey, toKey);
    }
}
