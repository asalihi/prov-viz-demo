import { Component, ViewChild, EventEmitter } from '@angular/core';

import { MapperService } from './mapper.service';
import { EVENTS } from './model/events';
import { DagreD3Renderer } from './dagre-d3-renderer';

@Component({
  selector: 'graph',
  providers: [MapperService],
  inputs: ['data:graph'],
  outputs: ['ngGraphRendered', 'ngGraphClicked', 'ngNodeClicked', 'ngNodeCtrlClicked', 'ngEdgeClicked', 'ngEdgeCtrlClicked'],
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent {
  private static readonly defaultMode = 'simplified';
  private static readonly simplifiedMode = 'simplified';
  private static readonly extendedMode = 'extended';
  private mode:string;
  private rendering:boolean;
  private error:boolean;
  private graph:Object;
  data:Object;
  @ViewChild('svgContainer') svgContainer;
  ngGraphRendered:EventEmitter<Object>;
  ngGraphClicked:EventEmitter<Object>;
  ngNodeClicked:EventEmitter<Object>;
  ngNodeCtrlClicked:EventEmitter<Object>;
  ngEdgeClicked:EventEmitter<Object>;
  ngEdgeCtrlClicked:EventEmitter<Object>;

  /**
   * Constructor of DumperComponent
   * @param mapperService Injection of Mapper service
   */
  constructor(private mapperService: MapperService) {
    this.mode = GraphComponent.defaultMode;
    this.initializeGraphEventsListeners();
  }

  /**
   * Lifecycle hook called when view of component has been fully initialized
   * (see Angular documentation: https://angular.io/docs/ts/latest/api/core/index/AfterViewInit-class.html)
   */
  ngAfterViewInit() {
    this.setGraphEventsListeners();
  }

  /**
   * Lifecycle hook called when data-bound property of a directive changes
   * (see Angular documentation: https://angular.io/docs/ts/latest/api/core/index/OnChanges-class.html)
   */
  ngOnChanges(changes) {
    this.rendering = true;
    this.error = false;
    this.createGraph();
    this.displayGraph();
  }

  /**
   * Changes the mode for rendering graph (swtich between simplified and extended versions)
   * @param mode Selected mode for display
   */
  changeMode(mode:string):void {
    if(this.mode !== mode) {
      this.mode = (mode === GraphComponent.simplifiedMode || mode === GraphComponent.extendedMode) ? mode : GraphComponent.defaultMode;
      this.rendering = true;
      this.error = false;
      this.displayGraph();
    }
  }

  /**
   * Fits the content of the graph to the container with a delay of 500 ms
   */
  fitContent():void {
    DagreD3Renderer.fit(500);
  }

  /**
   * Zooms in the graph with a delay of 250 ms
   */
  zoomIn():void {
    DagreD3Renderer.zoomIn(250);
  }

  /**
   * Zooms out the graph with a delay of 250 ms
   */
  zoomOut():void {
    DagreD3Renderer.zoomOut(250);
  }

  /**
   * Initializes the EventEmitter attached to the graph
   */
  private initializeGraphEventsListeners():void {
    for(let eventName in EVENTS) {
      this[`ng${eventName.charAt(0).toUpperCase()+eventName.slice(1)}`] = new EventEmitter();
    }
  };

  /**
   * Sets the events listeners attached to the graph
   */
  private setGraphEventsListeners():void {
    var element:any = this.svgContainer.nativeElement;
    // For graphRendered event, we append a specific event listener to inform component that rendering is done
    element.addEventListener('graphRendered', (event) => {
      this.rendering = false;
    });
    for(let eventName in EVENTS) {
      element.addEventListener(eventName, (event) => {
        this[`ng${eventName.charAt(0).toUpperCase()+eventName.slice(1)}`].emit(event['detail'] || null);
      });
    }
  }

  /**
   * Creates the graph based on data provided
   */
  private createGraph():void {
    try {
      this.graph = this.mapperService.format(this.data);
    } catch(e) {
      this.handleError(e);
    }
  }

  /**
   * Displays the graph as SVG element
   * NOTE: By default, a delay of 500 ms is set before displaying graph for better user experience (loading icon does not disappear too rapidly when rendering is instant)
   */
  private displayGraph():void {
    setTimeout(() => {
      try {
        var graphToDisplay:Object = this.graph['provenance'] ? this.graph[this.mode] : this.graph[GraphComponent.extendedMode];
        DagreD3Renderer.initialize(this.svgContainer.nativeElement, graphToDisplay);
        DagreD3Renderer.renderGraph();
      } catch(e) {
        this.handleError(e, true);
      }
    }, 500);
  }

  /**
   * Handles error
   * @param exception Exception raised during creation or rendering of the graph
   * @param flush If set to true, any SVG element rendered in container is removed from it (default: false)
   */
  private handleError(exception:any, flush:boolean=false):void {
    this.rendering = false;
    this.error = true;
    console.error(exception);
    if(flush) {
      DagreD3Renderer.flush();
    }
  }
}
