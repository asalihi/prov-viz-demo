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
  private mode:string;
  private rendering:boolean;
  private graph:Object;
  data:Object;
  @ViewChild('svgContainer') svgContainer;
  ngGraphRendered:EventEmitter<Object>;
  ngGraphClicked:EventEmitter<Object>;
  ngNodeClicked:EventEmitter<Object>;
  ngNodeCtrlClicked:EventEmitter<Object>;
  ngEdgeClicked:EventEmitter<Object>;
  ngEdgeCtrlClicked:EventEmitter<Object>;

  constructor(private mapperService: MapperService) {
    this.mode = GraphComponent.defaultMode;
    this.initializeGraphEventsListeners();
  }

  ngAfterViewInit() {
    this.setGraphEventsListeners();
  }

  ngOnChanges(changes) {
    this.rendering = true;
    this.createGraph();
    this.displayGraph();
  }

  changeMode(mode:string):void {
    if(this.mode !== mode) {
      this.mode = (mode === 'simplified' || mode === 'extended') ? mode : GraphComponent.defaultMode;
      this.rendering = true;
      this.displayGraph();
    }
  }

  fitContent():void {
    DagreD3Renderer.fit(500);
  }

  zoomIn():void {
    DagreD3Renderer.zoomIn(250);
  }

  zoomOut():void {
    DagreD3Renderer.zoomOut(250);
  }

  private initializeGraphEventsListeners():void {
    for(let eventName in EVENTS) {
      this[`ng${eventName.charAt(0).toUpperCase()+eventName.slice(1)}`] = new EventEmitter();
    }
  };

  private setGraphEventsListeners():void {
    var element:any = this.svgContainer.nativeElement;
    element.addEventListener('graphRendered', (event) => {
      this.rendering = false;
    });
    for(let eventName in EVENTS) {
      element.addEventListener(eventName, (event) => {
        this[`ng${eventName.charAt(0).toUpperCase()+eventName.slice(1)}`].emit(event['detail'] || null);
      });
    }
  }

  private createGraph():void {
    this.graph = this.mapperService.format(this.data);
  }

  private displayGraph():void {
    setTimeout(() => {
      DagreD3Renderer.initialize(this.svgContainer.nativeElement, this.graph[this.mode]);
      DagreD3Renderer.renderGraph();
    }, 500);
  }
}
