export class Edge {
  private v:string;
  private w:string;
  private value:Object;

  constructor(source:string, target:string, label?:string) {
    this.v = source;
    this.w = target;
    this.value = {};
    this.value['label'] = label || this.getLabel();
  }

  getSource():string {
    return this.v;
  }

  setSource(source:string):void {
    this.v = source;
  }

  getTarget():string {
    return this.w;
  }

  setTarget(target:string):void {
    this.w = target;
  }

  getLabel():string {
    return this.value['label'] || '';
  }

  get(property:string):any {
    return this.value[property];
  }

  set(property:string, value:any):void {
    this.value[property] = value;
  }
}
