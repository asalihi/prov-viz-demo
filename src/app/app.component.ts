import { Component } from '@angular/core';

@Component({
  selector: 'prov-viz',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private graph:Object;

  /** Stores graph passed by user through the form
   * @param graph JSON-GRAPH instance
   */
  store(graph:Object):void {
    this.graph = graph;
  }
}
