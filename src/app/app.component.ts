import { Component } from '@angular/core';

@Component({
  selector: 'prov-viz',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private graph:Object;

  store(graph:Object):void {
    this.graph = graph;
  }
}
