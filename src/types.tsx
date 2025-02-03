export interface Node {
    id: string;
    parent?: string;
    labels?: string[];
    [key: string]: any;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    labels?: string[];
    [key: string]: any;
  }

export interface Graph {
    nodes: { data: Node }[];
    edges: { data: Edge }[];
}