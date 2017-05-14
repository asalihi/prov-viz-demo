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

function dispatchNodeEvent(eventName:string, element:any, nodeId:string):void {
  var event:CustomEvent = new CustomEvent(eventName, {
    'detail': {
      'nodeId': nodeId
    }
  });
  dispatchEvent(element, event);
}

function dispatchEdgeEvent(eventName:string, element:any, data:Object):void {
  var event:CustomEvent = new CustomEvent(eventName, {
    'detail': {
      'sourceId': data['sourceId'] || null,
      'targetId': data['targetId'] || null
    }
  });
  dispatchEvent(element, event);
}

function dispatchEvent(element:any, event:Event):void {
  element.dispatchEvent(event);
}
