import * as ajv from 'ajv';

import { JSON_GRAPH_SCHEMA } from './json-graph-schema';

export namespace CustomValidators {
  /**
   * Checks if FormControl value is valid JSON
   * @param control FormControl containing data entered by user
   * @return {"invalidJson": true} (where invalidJSON is name of error) if invalid JSON, null otherwise
   */
  export function isValidJson(control: any):Object {
    return checkIfValidJson(control.value) ? null : {"invalidJson": true};
  }

  /**
   * Checks if FormControl value is valid JSON-GRAPH instance
   * @param control FormControl containing data entered by user
   * @return {"invalidJsonGraphInstance": true} (where invalidJsonGraphInstance is name of error) if invalid JSON-GRAPH instance, null otherwise
   */
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

  /**
   * Checks if data passed as parameter can be parsed as JSON
   * @param data Data to check
   * @return True if data can be parsed as JSON, false otherwise
   */
  function checkIfValidJson(data:any):boolean {
    try {
      JSON.parse(data);
      return true;
    } catch (e) {
      return false;
    }
  }
}
