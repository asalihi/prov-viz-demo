import * as ajv from 'ajv';

import { JSON_GRAPH_SCHEMA } from './json-graph-schema';

export namespace CustomValidators {
  export function isValidJson(control: any):Object {
    return checkIfValidJson(control.value) ? null : {"invalidJson": true};
  }

  function checkIfValidJson(data:any):boolean {
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }

  export function isJsonGraphInstance(control: any):Object {
    var ajvInstance:any = new ajv();
    if(checkIfValidJson(control.value)) {
      var data:string = JSON.parse(control.value);
      var valid:boolean = ajvInstance.validate(JSON_GRAPH_SCHEMA, data);
      if(valid) {
        return null;
      }
    }
    return {"invalidJsonGraphInstance": true};
  }
}
