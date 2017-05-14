import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

import { SHAPES, COLORS } from './model/parameters';
import { EVENTS } from './model/events';
import { Node } from './model/node';
import { Edge } from './model/edge';

export class DagreD3Renderer {
  private static data:any;
  private static graph:any;
  private static containerId:string;
  private static containerElement:any;
  private static container:any;
  private static group:any;
  private static zoom:any;
  private static zoomInMultiplicator:number;
  private static zoomOutMultiplicator:number;
  private static render:any;
  private static dispatch:any;

  static initialize(containerElement:any, data:Object, options:Object={}):void {
    DagreD3Renderer.flush();
    DagreD3Renderer.setParameters(containerElement, data, options);
    DagreD3Renderer.setEvents();
    DagreD3Renderer.setGraphClickEventListener();
    DagreD3Renderer.setShapes();
    DagreD3Renderer.formatNodes();
    DagreD3Renderer.formatEdges();
    DagreD3Renderer.constructGraph();
  }

  static renderGraph(options:Object={}):void {
    DagreD3Renderer.render(DagreD3Renderer.group, DagreD3Renderer.graph);
    DagreD3Renderer.setNodesEvents();
    DagreD3Renderer.setEdgesEvents();
    DagreD3Renderer.formatText();
    DagreD3Renderer.setWidthAndHeight();
    DagreD3Renderer.setZoom();
    DagreD3Renderer.dispatch.call('graphRendered', this, DagreD3Renderer.containerElement);
  }

  static fit(delay:number=0):void {
  	var bounds = DagreD3Renderer.group.node().getBBox();
  	var parent = DagreD3Renderer.group.node().parentElement;
  	var fullWidth:number = parent.clientWidth || parent.parentNode.clientWidth;
  	var fullHeight:number = parent.clientHeight || parent.parentNode.clientHeight;
  	var width:number = bounds.width;
  	var height:number = bounds.height;
  	var midX:number = bounds.x + width/2;
  	var midY:number = bounds.y + height/2;
  	if (width !== 0 && height !== 0) {
    	var scale:number = 0.95/Math.max(width/fullWidth, height/fullHeight);
    	var translate:number[] = [fullWidth/2 - scale*midX, fullHeight/2 - scale*midY];
      DagreD3Renderer.container.transition().duration(delay).call(DagreD3Renderer.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }
  }

  static zoomIn(delay:number=0):void {
    DagreD3Renderer.container.transition().duration(delay).call(DagreD3Renderer.zoom.scaleBy, DagreD3Renderer.zoomInMultiplicator);
  }

  static zoomOut(delay:number=0):void {
    DagreD3Renderer.container.transition().duration(delay).call(DagreD3Renderer.zoom.scaleBy, DagreD3Renderer.zoomOutMultiplicator);
  }

  private static flush():void {
    d3.select(DagreD3Renderer.containerElement).selectAll('svg').remove();
  }

  private static setParameters(containerElement:any, data:Object, options:Object):void {
    DagreD3Renderer.data = data;
    DagreD3Renderer.zoomInMultiplicator = options['zoom-in'] || 1.5;
    DagreD3Renderer.zoomOutMultiplicator = options['zoom-out'] || 0.75;
    DagreD3Renderer.containerElement = containerElement;
    DagreD3Renderer.container = d3.select(DagreD3Renderer.containerElement).append('svg:svg');
    DagreD3Renderer.group = DagreD3Renderer.container.append('g');
    DagreD3Renderer.render = new dagreD3.render();
  }

  private static setEvents():void {
    DagreD3Renderer.dispatch = d3.dispatch(...<string[]>(Object.keys(EVENTS)));
    for(let eventName in EVENTS) {
      DagreD3Renderer.dispatch.on(eventName, EVENTS[eventName]);
    }
  }

  private static setGraphClickEventListener():void {
    DagreD3Renderer.container.on('click', function() {
      if(d3.event.srcElement.tagName == 'svg') {
        var mousePosition:number[] = d3.mouse(this);
        DagreD3Renderer.dispatch.call('graphClicked', DagreD3Renderer.container, DagreD3Renderer.containerElement, mousePosition[0], mousePosition[1]);
      }
    });
  }

  private static setShapes():void {
    DagreD3Renderer.render.shapes()['hexagon'] = (parent, bbox, node) => DagreD3Renderer.createHexagon(parent, bbox, node);
  }

  private static createHexagon(parent:any, bbox:any, node:any):any {
    var w:number = bbox.width;
    var h:number = bbox.height;
    var points:{x:number, y:number}[] = [{x: 0, y: 0}, {x: w, y: 0}, {x: w, y: -h}, {x: w/2, y: -h * 3/2}, {x: 0, y: -h}];
    var shape:any = parent.insert('polygon', ':first-child')
                          .attr('points', points.map(d => `${d.x}, ${d.y}`).join(' '))
                          .attr('transform', `translate(${-w/2}, ${h*3/4})`);
    node['intersect'] = (point) => dagreD3.intersect.polygon(node, points, point);
    return shape;
  }

  private static formatNodes():void {
    if(DagreD3Renderer.data && DagreD3Renderer.data['nodes']) {
      DagreD3Renderer.data['nodes'].forEach(v => DagreD3Renderer.formatNode(v));
    }
  }

  private static formatNode(nodeId:string):void {
    var node:any = DagreD3Renderer.data['nodes'].find(v => v === nodeId);
    DagreD3Renderer.setNodeShape(node);
    DagreD3Renderer.setNodeStyle(node);
  }

  private static setNodeShape(node:Node):void {
    var type:string = node.getType();
    var subType:string = node.get('subType');
    var shape:string = SHAPES[type] || SHAPES[subType] || SHAPES['default'];
    node.set('shape', shape);
  }

  private static setNodeStyle(node:Node):void {
    DagreD3Renderer.setNodeColor(node);
  }

  private static setNodeColor(node:Node):void {
    var type:string = node.getType();
    var subType:string = node.get('subType');
    var colorProperties:Object = COLORS[type] || COLORS[subType] || COLORS['default'];
    var backgroundColor:string = colorProperties['background'];
    var borderColor:string = colorProperties['border'];
    node.set('style', `fill: ${backgroundColor}; stroke: ${borderColor};`);
  }

  private static formatEdges():void {
    if(DagreD3Renderer.data && DagreD3Renderer.data['edges']) {
      DagreD3Renderer.data['edges'].forEach(e => DagreD3Renderer.formatEdge(e));
    }
  }

  private static formatEdge(edge:Edge):void {
    DagreD3Renderer.setEdgeStyle(edge);
  }

  private static setEdgeStyle(edge:Edge):void {
    DagreD3Renderer.setEdgeColor(edge);
  }

  private static setEdgeColor(edge:Edge):void {
    edge.set('style', `fill: none; stroke: black; stroke-width: 1.5px;`);
  }

  private static constructGraph():void {
    DagreD3Renderer.graph = dagreD3.graphlib.json.read(DagreD3Renderer.data);
  }

  private static setNodesEvents():void {
    d3.selectAll('.node')
      .on('contextmenu', () => {
        d3.event.preventDefault();
      })
      .on('mousedown', nodeId => {
        d3.event.stopPropagation();
        if (d3.event.ctrlKey) {
          DagreD3Renderer.dispatch.call('nodeCtrlClicked', this, DagreD3Renderer.containerElement, nodeId);
        } else {
          DagreD3Renderer.dispatch.call('nodeClicked', this, DagreD3Renderer.containerElement, nodeId);
        }
      });
  }

  private static setEdgesEvents():void {
    d3.selectAll('.edgePath, .edgeLabel')
      .on('contextmenu', () => {
        d3.event.preventDefault();
      })
      .on('mousedown', e => {
        d3.event.stopPropagation();
        var data:Object = {};
        data['sourceId'] = e['v'] || null;
        data['targetId'] = e['w'] || null;
        if (d3.event.ctrlKey) {
          DagreD3Renderer.dispatch.call('edgeCtrlClicked', this, DagreD3Renderer.containerElement, data);
        } else {
          DagreD3Renderer.dispatch.call('edgeClicked', this, DagreD3Renderer.containerElement, data);
        }
      });
  }

  private static formatText():void {
    DagreD3Renderer.container.selectAll('svg text').style('font', `300 14px 'Helvetica Neue', Helvetica`);
  }

  private static setZoom():void {
    DagreD3Renderer.zoom = d3.zoom().on('zoom', () => { DagreD3Renderer.group.attr('transform', d3.event.transform) });
    DagreD3Renderer.container.call(DagreD3Renderer.zoom);
    DagreD3Renderer.fit();
  }

  private static setWidthAndHeight():void {
    DagreD3Renderer.container.attr('width', '100%').attr('height', '100%');

  }
}
