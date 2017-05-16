import * as _ from 'lodash';
import * as d3 from 'd3';
import * as dagreD3 from 'dagre-d3';

import { ALLOWED_SHAPES, SHAPES, COLORS } from './model/parameters';
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

  /**
   * Initializes the renderer
   * @param containerElement DOM element where SVG will be attached
   * @param data Object containing graph to render
   * @param options Options to associate with the renderer
   */
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

  /**
   * Renders the graph
   * @param options Options to associate with the renderer
   */
  static renderGraph(options:Object={}):void {
    DagreD3Renderer.render(DagreD3Renderer.group, DagreD3Renderer.graph);
    DagreD3Renderer.setNodesEvents();
    DagreD3Renderer.setEdgesEvents();
    DagreD3Renderer.formatText();
    DagreD3Renderer.setWidthAndHeight();
    DagreD3Renderer.setZoom();
    DagreD3Renderer.dispatch.call('graphRendered', this, DagreD3Renderer.containerElement);
  }

  /**
   * Fits the content of the graph to the container
   * @param delay (optional, default = 0) Delay of the transition
   */
  static fit(delay:number=0):void {
  	var bounds = DagreD3Renderer.group.node().getBBox();
  	var parent = DagreD3Renderer.group.node().parentElement;
  	var fullWidth:number = parent.clientWidth || parent.parentNode.clientWidth; // OR statement is needed to make it compatible with Chrome and Firefox
  	var fullHeight:number = parent.clientHeight || parent.parentNode.clientHeight; // OR statement is needed to make it compatible with Chrome and Firefox
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

  /**
   * Zooms in the graph
   * @param delay (optional, default = 0) Delay of the transition
   */
  static zoomIn(delay:number=0):void {
    DagreD3Renderer.container.transition().duration(delay).call(DagreD3Renderer.zoom.scaleBy, DagreD3Renderer.zoomInMultiplicator);
  }

  /**
   * Zooms out the graph
   * @param delay (optional, default = 0) Delay of the transition
   */
  static zoomOut(delay:number=0):void {
    DagreD3Renderer.container.transition().duration(delay).call(DagreD3Renderer.zoom.scaleBy, DagreD3Renderer.zoomOutMultiplicator);
  }

  /**
   * Removes rendered graph if any
   */
  static flush():void {
    d3.select(DagreD3Renderer.containerElement).selectAll('svg').remove();
  }

  /**
   * Sets the options related to the renderer
   * @param containerElement DOM element where SVG will be attached
   * @param data Object containing graph to render
   * @param options Options to associate with the renderer
   */
  private static setParameters(containerElement:any, data:Object, options:Object):void {
    DagreD3Renderer.data = data;
    DagreD3Renderer.zoomInMultiplicator = options['zoom-in'] || 1.5;
    DagreD3Renderer.zoomOutMultiplicator = options['zoom-out'] || 0.75;
    DagreD3Renderer.containerElement = containerElement;
    DagreD3Renderer.container = d3.select(DagreD3Renderer.containerElement).append('svg:svg');
    DagreD3Renderer.group = DagreD3Renderer.container.append('g');
    DagreD3Renderer.render = new dagreD3.render();
  }

  /**
   * Sets events attached to the graph
   */
  private static setEvents():void {
    DagreD3Renderer.dispatch = d3.dispatch(...<string[]>(Object.keys(EVENTS)));
    for(let eventName in EVENTS) {
      // For each event dispatched by the renderer, we fire the appropriate event from the container (DOM element)
      DagreD3Renderer.dispatch.on(eventName, EVENTS[eventName]);
    }
  }

  /**
   * Sets the click on the graph event
   */
  private static setGraphClickEventListener():void {
    DagreD3Renderer.container.on('click', function() {
      // User clicked on the SVG element (graph)
      if(d3.event.srcElement.tagName == 'svg') {
        var mousePosition:number[] = d3.mouse(this);
        // Data passed to the event: graph container, DOM element, mouse position (x and y coordinates)
        DagreD3Renderer.dispatch.call('graphClicked', DagreD3Renderer.container, DagreD3Renderer.containerElement, mousePosition[0], mousePosition[1]);
      }
    });
  }

  /**
   * Sets all custom shapes used by renderer (shapes are appended to the render function of the renderer)
   */
  private static setShapes():void {
    // See dagre-d3 documentation and demo example for mode details
    DagreD3Renderer.render.shapes()['hexagon'] = (parent, bbox, node) => DagreD3Renderer.createHexagon(parent, bbox, node);
  }

  /**
   * Creates and appends hexagon shape
   * @param parent Parent element that will hosts the polygon
   * @param bbox Bounding box of element
   * @param node Node represented by the element on the graph
   * @return Hexagon shape
   * IMPORTANT: parent is modified through the function (polygon representing the shape is inserted)
   */
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

  /**
   * Formats all the Nodes
   */
  private static formatNodes():void {
    if(DagreD3Renderer.data && DagreD3Renderer.data['nodes']) {
      DagreD3Renderer.data['nodes'].forEach(v => DagreD3Renderer.formatNode(v));
    }
  }

  /**
   * Formats Node
   * @param nodeID Identifier of the Node to be formatted
   * IMPORTANT: Node is modified by inner functions
   */
  private static formatNode(nodeId:string):void {
    var node:any = DagreD3Renderer.data['nodes'].find(v => v === nodeId);
    DagreD3Renderer.setNodeShape(node);
    DagreD3Renderer.setNodeStyle(node);
  }

  /**
   * Sets the shape of the Node (by default, diamond is chosen)
   * @param node Node for which shape must be set
   * IMPORTANT: Node is modified through the function (shape is set)
   */
  private static setNodeShape(node:Node):void {
    var type:string = node.getType();
    var subType:string = node.get('subType');
    var shape:string = SHAPES[type] || SHAPES[subType] || (node.get('shape') && _.includes(ALLOWED_SHAPES, node.get('shape')) ? node.get('shape') : SHAPES['default']);
    node.set('shape', shape);
  }

  /**
   * Sets the style of the Node
   * @param node Node for which style must be set
   * IMPORTANT: Node is modified by inner function
   */
  private static setNodeStyle(node:Node):void {
    DagreD3Renderer.setNodeColor(node);
  }

  /**
   * Sets the color of the Node (by default, background is in white and borders are in black)
   * @param node Node for which color must be set
   * IMPORTANT: Node is modified through the function (style is set)
   */
  private static setNodeColor(node:Node):void {
    var type:string = node.getType();
    var subType:string = node.get('subType');
    var colorProperties:Object = COLORS[type] || COLORS[subType] || ((node.get('color') && _.isObject(node.get('color'))) ? node.get('color') : COLORS['default']);
    var backgroundColor:string = colorProperties['background'] || COLORS['default']['background'];
    var borderColor:string = colorProperties['border'] || COLORS['default']['border'];
    node.set('style', `fill: ${backgroundColor}; stroke: ${borderColor};`);
  }

  /**
   * Formats all the Edges
   */
  private static formatEdges():void {
    if(DagreD3Renderer.data && DagreD3Renderer.data['edges']) {
      DagreD3Renderer.data['edges'].forEach(e => DagreD3Renderer.formatEdge(e));
    }
  }

  /**
   * Formats an Edge
   * @param edge Edge to be formatted
   * IMPORTANT: Edge is modified by inner function
   */
  private static formatEdge(edge:Edge):void {
    DagreD3Renderer.setEdgeStyle(edge);
  }

  /**
   * Sets style of the Edge
   * @param edge Edge for which style must be set
   * IMPORTANT: Edge is modified by inner function
   */
  private static setEdgeStyle(edge:Edge):void {
    DagreD3Renderer.setEdgeColor(edge);
  }

  /**
   * Sets the color of the Edge
   * @param edge Edge for which color must be set
   * IMPORTANT: Node is modified through the function (style is set)
   */
  private static setEdgeColor(edge:Edge):void {
    edge.set('style', 'fill: none; stroke: black; stroke-width: 1.5px;');
  }

  /**
   * Constructs the graph (graph complies with graphlib format)
   */
  private static constructGraph():void {
    DagreD3Renderer.graph = dagreD3.graphlib.json.read(DagreD3Renderer.data);
  }

  /**
   * Sets events attached to the Nodes
   */
  private static setNodesEvents():void {
    d3.selectAll('.node')
      .on('contextmenu', () => {
        // We prevent the context menu from displaying when user CTRL+clicks
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

  /**
   * Sets events attached to the Edges
   */
  private static setEdgesEvents():void {
    d3.selectAll('.edgePath, .edgeLabel')
      .on('contextmenu', () => {
        // We prevent the context menu from displaying when user CTRL+clicks
        d3.event.preventDefault();
      })
      .on('mousedown', e => {
        d3.event.stopPropagation();
        var data:Object = {};
        data['sourceId'] = e['v'] || null; // v represents source (see graphlib specification)
        data['targetId'] = e['w'] || null; // w represents target (see graphlib specification)
        if (d3.event.ctrlKey) {
          DagreD3Renderer.dispatch.call('edgeCtrlClicked', this, DagreD3Renderer.containerElement, data);
        } else {
          DagreD3Renderer.dispatch.call('edgeClicked', this, DagreD3Renderer.containerElement, data);
        }
      });
  }

  /**
   * Formats text displayed on SVG element
   */
  private static formatText():void {
    DagreD3Renderer.container.selectAll('svg text').style('font', `300 14px 'Helvetica Neue', Helvetica`);
  }

  /**
   * Sets zoom functionality on the renderer
   */
  private static setZoom():void {
    DagreD3Renderer.zoom = d3.zoom().on('zoom', () => { DagreD3Renderer.group.attr('transform', d3.event.transform) });
    DagreD3Renderer.container.call(DagreD3Renderer.zoom);
    DagreD3Renderer.fit(); // By default, graph fits within the container
  }

  /**
   * Sets the width and the height of the SVG element such that it fully expands
   */
  private static setWidthAndHeight():void {
    DagreD3Renderer.container.attr('width', '100%').attr('height', '100%');
  }
}
