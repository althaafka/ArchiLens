import cytoscape from "cytoscape";
import { getEdgesByLabel, getNodesByLabel } from "../../utils/graphUtils";
import { edgeHasLabel } from "../../utils/edgeUtils";
import { nodeHasLabels } from "../../utils/nodeUtils";

export class DimensionEnricher {
  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy
  }

  public enrich(): void {
    const edges = this.cy.edges();
    const nodes = this.cy.nodes();

    const composesEdges = getEdgesByLabel(edges, 'composes');
    const implementsEdges = getEdgesByLabel(edges, 'implements');
    const succeedsEdges = getEdgesByLabel(edges, 'succeeds');
    
    const dimensions = getNodesByLabel(nodes, 'Dimension');
    const categories = getNodesByLabel(nodes, 'Category');

    dimensions?.forEach(dim => {
      const composesCategories = composesEdges
        .filter(edge => edge.data('source') === dim.id())
        .map(edge => edge.data('target'));

      let orderedCategories = [];
      let startCategory
      composesCategories.forEach(cat => {
        const succeeds = succeedsEdges.filter(edge => edge.data('target') == cat);
        if (succeeds.length == 0) {
            startCategory = cat;
        }
      });

      let nextCategory = succeedsEdges.filter(edge => edge.data('source') == startCategory);
      while (nextCategory.length > 0) {
          const nextCat = nextCategory[0].data('target');
          orderedCategories.push(nextCat);
          nextCategory = succeedsEdges.filter(edge => edge.data('source') == nextCat);
      }
      orderedCategories.unshift(startCategory);
      orderedCategories.push("-");

      dim.data('categories', orderedCategories);
    })

    categories?.forEach(cat => {
      const categoriesMember = implementsEdges
          .filter(edge => edge.data('target') === cat.id())
          .map(edge => edge.data('source'));
      cat.data('members', categoriesMember);
    });

    implementsEdges?.forEach(edge => {
      const node = this.cy.getElementById(edge.data('source'));
      if (!node.data('properties').dimension) {
        node.data('properties').dimension = {};
      }

      const dimId = composesEdges.filter(cEdge => edge.data('target') === cEdge.data('target'))[0]?.data('source');

      if (!node.data('properties').dimension[dimId]) {
        node.data('properties').dimension[dimId] = [];
      }

      node.data('properties').dimension[dimId].push(edge.data('target'));
    });

    const allNodes = this.cy.nodes().filter(node => {
      const id = node.id();
      const isExcluded = id === 'java.lang.String';
      const labels = node.data('labels') || [];
      return !isExcluded && !labels.includes('Container') && labels.includes('Structure');
    });
    
    dimensions?.forEach(dim => {
      const dimId = dim.id();
      allNodes.forEach(node => {
        if (!node.data('properties').dimension) {
          node.data('properties').dimension = {};
        }
    
        const hasCategory = node.data('properties').dimension[dimId];
    
        if (!hasCategory || hasCategory.length === 0) {
          node.data('properties').dimension[dimId] = ["-"];
        }
      });
    });
  }
}

export class MetricEnricher {
  private cy: cytoscape.Core;

  constructor(cy: cytoscape.Core) {
    this.cy = cy
  }

  public enrich(): void {
    const edges = this.cy.edges();
    const nodes = this.cy.nodes();

    const measuresEdges = getEdgesByLabel(edges, 'measures');
    const metrics = getNodesByLabel(nodes, 'Metric');

    metrics?.forEach(metric => {
      const measuredNode = measuresEdges
          .filter(edge => edge.data('target') === metric.id())
          .map(edge => [edge.data('source'), edge.data('properties').value]);

      metric.data("properties").members = measuredNode;

      let maxVal = -Infinity;
      let minVal = Infinity;
      measuredNode.forEach(([nodeId, value]) => {
          const node = this.cy.getElementById(nodeId)
          if (maxVal < value) maxVal = value
          if (minVal > value) minVal = value

          
          if (!node.data('properties').metric) {
              node.data('properties').metric = {};
              
              const metricId = metric.id();
              
              if (!node.data('properties').metric[metricId]) {
                  node.data('properties').metric[metricId] = value;
              }
              node.data('properties').metric[metricId] = value
          }
      })
      metrics.data('properties').maxValue = maxVal;
      metrics.data('properties').minValue = minVal;
    })
  }
}

export class ComposedDimensionEnricher {
  private cy: cytoscape.Core;
  private showStructure: boolean;

  constructor(cy: cytoscape.Core, showStructure: boolean) {
    this.cy = cy
    this.showStructure = showStructure
  }

  public enrich(): void {
    const edges = this.cy.edges();
    const nodes = this.cy.nodes();

    const structures = getNodesByLabel(nodes, 'Structure');
    const hasScripts = getEdgesByLabel(edges, 'hasScript');
    const composesEdges = getEdgesByLabel(edges, 'composes');
    const implementsEdges = getEdgesByLabel(edges, 'implements');

    const composedDimIds = composesEdges
      .filter(cEdge => {
        const categoryId = cEdge.data('target');
        const relatedImpls = edges.filter(edge =>
          edgeHasLabel(edge, 'implements') && edge.data('target') === categoryId
        );
        return relatedImpls.some(iEdge => {
          const sourceNode = this.cy.getElementById(iEdge.data('source'));
          return nodeHasLabels(sourceNode, ['Scripts']) || nodeHasLabels(sourceNode, ['Operation']);
        });
      })
      .map(cEdge => cEdge.data('source'));

    const simpleDimIds = getNodesByLabel(nodes, 'Dimension').map(node => node.id());
    const dimensionIds = Array.from(new Set([...composedDimIds, ...simpleDimIds]));

    structures.forEach(structure => {
      if (structure.id() === 'java.lang.String') return;
      const scriptEdges = hasScripts.filter(edge => edge.data('source') === structure.id());
      const scripts = scriptEdges.map(edge => this.cy.getElementById(edge.data('target')));
  
      const composedDimension: Record<string, string[]> = {};
  
      scripts.forEach(script => {
        composedDimIds.forEach(dimensionId => {
          const matchedImpl = implementsEdges.filter(edge =>
            edge.data('source') === script.id() && edge.data('target').split(':')[0] === dimensionId.split(':')[1]
          );
          if (!composedDimension[dimensionId]) composedDimension[dimensionId] = [];
          if (matchedImpl.length > 0) {
            composedDimension[dimensionId].push(matchedImpl[0].data('target'));
          } else {
            composedDimension[dimensionId].push('-');
          }
        });
      });
  
      composedDimIds.forEach(dimensionId => {
        if (!structure.data('properties').composedDimension) {
          structure.data('properties').composedDimension = {};
        }
  
        if (!composedDimension[dimensionId] || composedDimension[dimensionId].length === 0) {
          composedDimension[dimensionId] = [];
        }
  
        structure.data('properties').composedDimension[dimensionId] = this.counter(composedDimension[dimensionId]);
      });

      structure.addClass('layers');
    });
  
    const containers = nodes.filter(
      node => node.data('labels')?.includes('Container') && !node.data('labels')?.includes('Structure')
    );

    containers.forEach(container => {
      const contains = container.outgoers().filter(e => e.isEdge() && e.data('label') === 'contains');
      const classes = contains.targets().filter(t => t.data('labels')?.includes('Structure'));
      const subContainers = contains.targets().filter(t => t.data('labels')?.includes('Container'));
  
      const composedDimension: Record<string, any[]> = {};
  
      dimensionIds.forEach(dimensionId => {
        if (!container.data('properties').composedDimension) {
          container.data('properties').composedDimension = {};
        }
        if (!composedDimension[dimensionId]) composedDimension[dimensionId] = [];
  
        const layerCounters = classes.map(c => {
          const fromComposed = c.data('properties')?.composedDimension?.[dimensionId];
          if (fromComposed) {
            return this.counterToPercentage(fromComposed);
          }
          const fromSimple = c.data('properties')?.dimension?.[dimensionId] || [];
          return this.counterToPercentage(this.counter(fromSimple));
        });
  
        composedDimension[dimensionId].push(...layerCounters);
  
        subContainers.forEach(subContainer => {
          const subData = subContainer.data('properties')?.composedDimension?.[dimensionId];
          if (subData) {
            composedDimension[dimensionId].push(this.counterToPercentage(subData));
          }
        });
      });
  
      dimensionIds.forEach(dimensionId => {
        container.data('properties').composedDimension[dimensionId] = this.mergeCounters(composedDimension[dimensionId]);
      });
  
      container.addClass('layers');
      if (this.showStructure){
        container.addClass('package')
      }
    });   
  }

  private counter = (arr) => arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  private counterToPercentage(counter: Record<string, number>) {
      const total = Object.values(counter).reduce((sum, count) => sum + count, 0);
      const result: Record<string, number> = {};
      for (const key in counter) {
          result[key] = total ? counter[key] / total : 0;
      }
      return result;
  }

  private mergeCounters = (counters) => {
    return counters.reduce((acc, counter) => {
      Object.entries(counter).forEach(([key, val]) => {
        acc[key] = (acc[key] || 0) + val;
      });
      return acc;
    }, {});
  };
}