import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { Node } from './model/node';
import { Edge } from './model/edge';

@Injectable()
export class MapperService {
  private static readonly defaultDirection:string = 'BT';
  private direction:string;
  private nodes:Node[];
  private simplifiedNodes:Node[];
  private edges:Edge[];
  private simplifiedEdges:Edge[];
  private input:Object;
  private completeGraph:{value: {rankdir:string}, nodes:Node[], edges:Edge[]};
  private simplifiedGraph:{value: {rankdir:string}, nodes:Node[], edges:Edge[]};

  /**
   * Formats the input data
   * @param input (optional) Data to be formatted as graphlib instance
   * @return Formatted data (graphlib instance) if input, null otherwise
   */
  format(input?:Object):{provenance: boolean, simplified?:Object, extended:Object} {
    if(input) {
      this.input = input;
      this.direction = this.input['graph']['direction'] || MapperService.defaultDirection;
      if(this.input['graph'] && (this.input['graph']['type'] === 'Provenance')) {
        this.createProvenanceGraph();
        return {provenance: true, simplified: this.simplifiedGraph, extended: this.completeGraph};
      } else {
        this.createGenericGraph();
        return {provenance: false, extended: this.completeGraph};
      }
    } else {
      return null;
    }
  }

  /**
   * Creates graph of a Provenance trail
   */
  private createProvenanceGraph():void {
    this.createCompleteGraph();
    this.createSimplifiedGraph();
  }

  /**
   * Creates a generic graph
   */
  private createGenericGraph():void {
    this.createCompleteGraph();
  }

  /**
   * Creates the full graph associated to given Provenance trail
   */
  private createCompleteGraph():void {
    this.nodes = new Array<Node>();
    this.edges = new Array<Edge>();
    this.convertNodesAndEdges();
    this.completeGraph = {value: {rankdir: this.direction}, nodes: this.nodes, edges: this.edges};
  }

  /**
   * Creates the simplified version of the graph associated to given Provenance trail
   */
  private createSimplifiedGraph():void {
    this.simplifiedNodes = new Array<Node>();
    this.simplifiedEdges = new Array<Edge>();
    this.cloneDeepNodesAndEdges();
    this.convertNodesAndEdgesForSimpleGraph();
    this.simplifiedGraph = {value: {rankdir: this.direction}, nodes: this.simplifiedNodes, edges: this.simplifiedEdges};
  }

  /**
   * Converts all the Nodes and Edges from JSON-GRAPH to graphlib representation
   */
  private convertNodesAndEdges():void {
    if(this.input['graph']['nodes']) {
      this.convertNodes();
    }
    if(this.input['graph']['edges']) {
      this.convertEdges();
    }
  }

  /**
   * Converts all the Nodes from JSON-GRAPH to graphlib representation
   */
  private convertNodes():void {
    for(let jsonGraphNode of this.input['graph']['nodes']) {
      var id:string = jsonGraphNode['id'];
      var type:string = jsonGraphNode['type'] || null;
      var subType:string = (jsonGraphNode['metadata'] && jsonGraphNode['metadata']['subType']) || null;
      var label:string = jsonGraphNode['label'] || null;
      var node:Node = new Node(id, type, subType, label);
      for(let key in jsonGraphNode['metadata']) {
        node.set(key, jsonGraphNode['metadata'][key]);
      }
      node.set('labelType', 'html');
      this.nodes.push(node);
    }
  }

  /**
   * Converts all the Edges from JSON-GRAPH to graphlib representation
   */
  private convertEdges():void {
    for(let jsonGraphEdge of this.input['graph']['edges']) {
      if(this.checkIfSourceAndTargetExist(jsonGraphEdge)) {
        var source:string = jsonGraphEdge['source'];
        var target:string = jsonGraphEdge['target'];
        var edge:Edge = new Edge(source, target);
        for(let key in jsonGraphEdge['metadata']) {
          edge.set(key, jsonGraphEdge['metadata'][key]);
        }
        this.edges.push(edge);
      }
    }
  }

  /**
   * Converts all Nodes and Edges to build simplified version of graph
   */
  private convertNodesAndEdgesForSimpleGraph():void {
    this.removeAgents();
    this.mergeDatasetsAndRelatedResources();
    this.removeActivities();
  }

  /**
   * Removes all the Agents from the Provenance trail and associated Edges
   */
  private removeAgents():void {
    var agentsId:string[] = this.simplifiedNodes.filter(n => n.getType() === 'agent').map(n => n.getId());
    this.simplifiedNodes = this.simplifiedNodes.filter(n => !_.includes(agentsId, n.getId()));
    this.simplifiedEdges = this.simplifiedEdges.filter(e => !(_.includes(agentsId, e.getSource()) && !(_.includes(agentsId, e.getTarget()))));
  }

  /**
   * Merges all the Resources with their respective Datasets
   */
  private mergeDatasetsAndRelatedResources():void {
    var datasets:Node[] = this.simplifiedNodes.filter(n => n.getType() === 'entity' && n.get('subType') === 'dataset');
    for(let dataset of datasets) {
      this.mergeDatasetAndRelatedResources(dataset);
    }
  }

  /**
   * Merge all the Resources of a given Dataset
   * @param dataset Dataset for which Resources must be merged with
   * IMPORTANT: dataset is modified through the function and by inner function
   */
  private mergeDatasetAndRelatedResources(dataset: Node):void {
    var resourcesId:string[] = this.simplifiedEdges.filter(e => e.getTarget() === dataset.getId()).map(e => e.getSource());
    if(Array.isArray(resourcesId) && resourcesId.length) {
      var resources:Node[] = this.simplifiedNodes.filter(n => _.includes(resourcesId, n.getId()));
      dataset.set('members', []);
      for(let resource of resources) {
        this.linkDatasetWithElementsRelatedToResource(dataset, resource);
      }
      this.changeLabelOfDataset(dataset, resources);
      this.removeResourcesFromSimplifiedGraph(resourcesId);
    }
  }

  /**
   * Links a given Dataset with all Elements that are linked with Resource it is linked with
   * @param dataset Dataset to be considered for linking
   * @param resource Resource linked with the Dataset
   */
  private linkDatasetWithElementsRelatedToResource(dataset: Node, resource: Node):void {
    dataset.append('members', resource);
    var elementsLinkedWithResource:string[] = this.simplifiedEdges.filter(e => e.getTarget() === resource.getId()).map(e => e.getSource());
    for(let element of elementsLinkedWithResource) {
      this.simplifiedEdges.push(new Edge(element, dataset.getId(), 'was derived from'));
    }
  }

  /**
   * Changes the label of a Dataset to show number of Resources it contains
   * @param dataset Dataset for which label is modified
   * @param resources Resources linked to the Dataset
   * IMPORTANT: dataset is modified through the function
   */
  private changeLabelOfDataset(dataset: Node, resources: Node[]):void {
    dataset.append('label', `<br>${resources.length} resource${resources.length > 1 ? 's' : ''}`);
  }

  /**
   * Removes all the resources from the simplified version of the graph
   * @param resourcesId Identifiers of all the resources
   */
  private removeResourcesFromSimplifiedGraph(resourcesId: string[]):void {
    this.simplifiedNodes = this.simplifiedNodes.filter(n => !_.includes(resourcesId, n.getId()));
    this.simplifiedEdges = this.simplifiedEdges.filter(e => !_.includes(resourcesId, e.getSource()) && !_.includes(resourcesId, e.getTarget()));
  }

  /**
   * Removes all activities from the simplified version of the graph
   */
  private removeActivities():void {
    var activities:Node[] = this.simplifiedNodes.filter(n => n.getType() === 'activity' || n.get('subtype') === 'activity');
    for(let activity of activities) {
      this.linkSourcesAndGeneratedEntitiesOfActivity(activity);
    }
    this.simplifiedNodes = this.simplifiedNodes.filter(n => n.getType() === 'entity');
  }

  /**
   * Creates edges between all sources and generated entities of a given activity
   * @param activity Activity to be considered for creation of edges between sources and generated entities
   */
  private linkSourcesAndGeneratedEntitiesOfActivity(activity: Node):void {
    var sourcesId:string[] = this.simplifiedEdges.filter(e => e.getSource() === activity.getId()).map(e => e.getTarget());
    var generatedElementsId:string[] = this.simplifiedEdges.filter(e => e.getTarget() === activity.getId()).map(e => e.getSource());
    for(let sourceId of sourcesId) {
      for(let generatedElementId of generatedElementsId) {
        this.simplifiedEdges.push(new Edge(generatedElementId, sourceId, 'was derived from'));
      }
    }
    this.simplifiedEdges = this.simplifiedEdges.filter(e => !(e.getSource() === activity.getId()) && !(e.getTarget() === activity.getId()));
  }

  /**
   * Clones Nodes and Edges of the complete graph
   */
  private cloneDeepNodesAndEdges():void {
    this.cloneDeepNodes();
    this.cloneDeepEdges();
  }

  /**
   * Clones Nodes of the complete graph
   */
  private cloneDeepNodes():void {
    for(let node of this.nodes) {
      this.simplifiedNodes.push(_.cloneDeep(_.toPlainObject(node)));
    }
  }

  /**
   * Clones Edges of the complete graph
   */
  private cloneDeepEdges():void {
    for(let edge of this.edges) {
      this.simplifiedEdges.push(_.cloneDeep(_.toPlainObject(edge)));
    }
  }

  /**
   * Checks if an Edge is valid (both source and target exist in the graph)
   * @param jsonGraphEdge JSON-GRAPH Edge to be validated
   * @return True if Edge is valid, false otherwise
   */
  private checkIfSourceAndTargetExist(jsonGraphEdge:Object):boolean {
    var source:Node = this.nodes.find(n => n.getId() === jsonGraphEdge['source']);
    var target:Node = this.nodes.find(n => n.getId() === jsonGraphEdge['target']);
    return (source && target) ? true : false;
  }
}
