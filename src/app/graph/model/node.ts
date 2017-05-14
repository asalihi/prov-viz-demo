import * as uuid from 'uuid';

export class Node {
  protected v?:string;
  protected value:Object;

  constructor(type:string, subType?:string, id?:string, label?:string) {
    this.v = id || `temp_${uuid.v1()}`;
    this.value = {};
    this.value['type'] = type;
    this.value['label'] = label || this.getLabel();
    this.value['subType'] = subType || null;
  }

  getId():string {
    return this.v;
  }

  setId(id:string):void {
    this.v = id;
  }

  getType():string {
    return this.value['type'];
  }

  getLabel():string {
    return this.value['label'] || this.value['type'].toUpperCase();
  }

  get(property:string):any {
    return this.value[property];
  }

  set(property:string, value:any):void {
    this.value[property] = value;
  }

  append(property:string, element:any, key?:string):void {
    if(this.value[property]) {
      this.appendElement(property, element, key);
    }
  }

  private appendElement(property:string, element:any, key?:string):void {
    if(typeof this.value[property] === 'string') {
      this.value[property] += element;
    } else if((typeof this.value[property] === 'object') && key) {
      this.value[property][key] = element;
    } else if(Array.isArray(this.value[property])) {
      this.value[property].push(element);
    }
  }
}
