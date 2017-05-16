export const EVENTS:Object = {
  'graphRendered': (element:any) => {
    var event:Event = new Event('graphRendered');
    dispatchEvent(element, event);
  },
  'graphClicked': (element:any, x:number, y:number) => {
    var event:Event = new CustomEvent('graphClicked', {
      'detail': {
        'x': x,
        'y': y
      }
    });
    dispatchEvent(element, event);
  },
  'nodeClicked': (element:any, nodeId:string) => {
    dispatchNodeEvent('nodeClicked', element, nodeId);
  },
  'nodeCtrlClicked': (element:any, nodeId:string) => {
    dispatchNodeEvent('nodeCtrlClicked', element, nodeId);
  },
  'edgeClicked': (element:any, data:Object) => {
    dispatchEdgeEvent('edgeClicked', element, data);
  },
  'edgeCtrlClicked': (element:any, data:Object) => {
    dispatchEdgeEvent('edgeCtrlClicked', element, data);
  }
}

/**
 * Dispatches a Node event
 * @param eventName Name of the event to be dispatched
 * @param element DOM element on which Node event must be dispatched
 * @param nodeId Identifier of the Node related to the event
 */
function dispatchNodeEvent(eventName:string, element:any, nodeId:string):void {
  var event:CustomEvent = new CustomEvent(eventName, {
    'detail': {
      'nodeId': nodeId
    }
  });
  dispatchEvent(element, event);
}

/**
 * Dispatches an Edge event
 * @param eventName Name of the event to be dispatched
 * @param element DOM element on which Edge event must be dispatched
 * @param data Data containing relevant source and target of the Edge related to the event
 */
function dispatchEdgeEvent(eventName:string, element:any, data:Object):void {
  var event:CustomEvent = new CustomEvent(eventName, {
    'detail': {
      'sourceId': data['sourceId'] || null,
      'targetId': data['targetId'] || null
    }
  });
  dispatchEvent(element, event);
}

/**
 * Dispatches a DOM event
 * @param element DOM element on which event must be dispatched
 * @param event Event to be dispatched
 */
function dispatchEvent(element:any, event:Event):void {
  element.dispatchEvent(event);
}
