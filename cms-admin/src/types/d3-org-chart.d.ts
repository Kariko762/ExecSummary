declare module 'd3-org-chart' {
  export class OrgChart {
    constructor();
    container(selector: HTMLElement | string): this;
    data(data: any[]): this;
    nodeWidth(width: number | ((d: any) => number)): this;
    nodeHeight(height: number | ((d: any) => number)): this;
    childrenMargin(margin: number | ((d: any) => number)): this;
    compactMarginBetween(margin: number | ((d: any) => number)): this;
    compactMarginPair(margin: number | ((d: any) => number)): this;
    neighbourMargin(margin: number | ((d: any) => number)): this;
    siblingsMargin(margin: number | ((d: any) => number)): this;
    nodeContent(content: string | ((d: any) => string)): this;
    onNodeClick(callback: (d: any) => void): this;
    render(): this;
    zoomIn(): this;
    zoomOut(): this;
    fit(): this;
    setCentered(nodeId: string): this;
    setHighlighted(nodeId: string): this;
    clearHighlighting(): this;
    exportImg(options?: { save?: boolean; full?: boolean; onLoad?: () => void }): this;
    exportSvg(): this;
  }
}
