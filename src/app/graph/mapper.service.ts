import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { Node } from './model/node';
import { Edge } from './model/edge';

@Injectable()
export class MapperService {
  private nodes:Node[];
  private simplifiedNodes:Node[];
  private edges:Edge[];
  private simplifiedEdges:Edge[];
  private input:Object;
  private completeGraph:{value: {rankdir:string}, nodes:Node[], edges:Edge[]};
  private simplifiedGraph:{value: {rankdir:string}, nodes:Node[], edges:Edge[]};

  format(input?:Object):{simplified:Object, extended:Object} {
    if(input) {
      this.input = input;
      this.createCompleteGraph();
      this.createSimplifiedGraph();
      return {simplified: this.simplifiedGraph, extended: this.completeGraph};
    } else {
      return null;
    }
  }

  private createCompleteGraph():void {
    this.convertNodesAndEdges();
    this.completeGraph = {value: {rankdir: 'BT'}, nodes: this.nodes, edges: this.edges};
  }

  private createSimplifiedGraph():void {
    this.convertNodesAndEdgesForSimpleGraph();
    this.simplifiedGraph = {value: {rankdir: 'BT'}, nodes: this.simplifiedNodes, edges: this.simplifiedEdges};
  }

  private convertNodesAndEdges():void {
    this.nodes = new Array<Node>();
    this.simplifiedNodes = new Array<Node>();
    this.edges = new Array<Edge>();
    this.simplifiedEdges = new Array<Edge>();
    if(this.input['graph']['nodes']) {
      this.convertNodes();
    }
    if(this.input['graph']['edges']) {
      this.convertEdges();
    }
  }

  private convertNodes():void {
    for(let jsonGraphNode of this.input['graph']['nodes']) {
      var type:string = jsonGraphNode['type'];
      var subType:string = (jsonGraphNode['metadata'] && jsonGraphNode['metadata']['subType']) || null;
      var label:string = jsonGraphNode['label'] || null;
      var node:Node = new Node(type, subType, jsonGraphNode['id'], label);
      for(let key in jsonGraphNode['metadata']) {
        node.set(key, jsonGraphNode['metadata'][key]);
      }
      node.set('labelType', 'html');
      this.appendNode(node);
    }
  }

  private convertEdges():void {
    for(let jsonGraphEdge of this.input['graph']['edges']) {
      if(this.checkIfSourceAndTargetExist(jsonGraphEdge)) {
        var edge:Edge = new Edge(jsonGraphEdge['source'], jsonGraphEdge['target']);
        for(let key in jsonGraphEdge['metadata']) {
          edge.set(key, jsonGraphEdge['metadata'][key]);
        }
        this.appendEdge(edge);
      }
    }
  }

  private convertNodesAndEdgesForSimpleGraph():void {
    this.removeAgents();
    this.mergeDatasetsAndRelatedResources();
    this.removeActivities();
  }

  private removeAgents():void {
    var agentsId:string[] = this.simplifiedNodes.filter(n => n.getType() === 'agent').map(n => n.getId());
    this.simplifiedNodes = this.simplifiedNodes.filter(n => !_.includes(agentsId, n.getId()));
    this.simplifiedEdges = this.simplifiedEdges.filter(e => !(_.includes(agentsId, e.getSource()) && !(_.includes(agentsId, e.getTarget()))));
  }

  private mergeDatasetsAndRelatedResources():void {
    var datasets:Node[] = this.simplifiedNodes.filter(n => n.getType() === 'entity' && n.get('subType') === 'dataset');
    for(let dataset of datasets) {
      this.mergeDatasetAndRelatedResources(dataset);
    }
  }

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

  private linkDatasetWithElementsRelatedToResource(dataset: Node, resource: Node):void {
    dataset.append('members', resource);
    var elementsLinkedWithResource:string[] = this.simplifiedEdges.filter(e => e.getTarget() === resource.getId()).map(e => e.getSource());
    for(let element of elementsLinkedWithResource) {
      this.simplifiedEdges.push(new Edge(element, dataset.getId(), 'was derived from'));
    }
  }

  private changeLabelOfDataset(dataset: Node, resources: Node[]):void {
    dataset.append('label', `<br>${resources.length} resource${resources.length > 1 ? 's' : ''}`);
  }

  private removeResourcesFromSimplifiedGraph(resourcesId: string[]):void {
    this.simplifiedNodes = this.simplifiedNodes.filter(n => !_.includes(resourcesId, n.getId()));
    this.simplifiedEdges = this.simplifiedEdges.filter(e => !_.includes(resourcesId, e.getSource()) && !_.includes(resourcesId, e.getTarget()));
  }

  private removeActivities():void {
    var activities:Node[] = this.simplifiedNodes.filter(n => n.getType() === 'activity' || n.get('subtype') === 'activity');
    for(let activity of activities) {
      this.linkSourcesAndGeneratedEntitiesOfActivity(activity);
    }
    this.simplifiedNodes = this.simplifiedNodes.filter(n => n.getType() === 'entity');
  }

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

  private appendNode(node:Node):void {
    this.nodes.push(node);
    this.simplifiedNodes.push(_.cloneDeep(_.toPlainObject(node)));
  }

  private appendEdge(edge:Edge):void {
    this.edges.push(edge);
    this.simplifiedEdges.push(_.cloneDeep(_.toPlainObject(edge)));
  }

  private checkIfSourceAndTargetExist(jsonGraphEdge:Object):boolean {
    var source:Node = this.nodes.find(n => n.getId() === jsonGraphEdge['source']);
    var target:Node = this.nodes.find(n => n.getId() === jsonGraphEdge['target']);
    return (source && target) ? true : false;
  }
}
