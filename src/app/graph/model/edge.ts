export class Edge {
  private v:string;
  private w:string;
  private value:Object;

  /**
   * Constructor of Edge
   * @param source Identifier of source of the edge
   * @param target Identifier of target of the edge
   * @param label (optional) Label to be displayed on the edge
   */
  constructor(source:string, target:string, label?:string) {
    this.v = source;
    this.w = target;
    this.value = {};
    this.value['label'] = label || this.getLabel();
  }

  /**
   * Getter: source
   * @return Identifier of source of the edge
   */
  getSource():string {
    return this.v;
  }

  /**
   * Setter: source
   * @param source Identifier of source of the edge
   */
  setSource(source:string):void {
    this.v = source;
  }

  /**
   * Getter: target
   * @return Identifier of target of the edge
   */
  getTarget():string {
    return this.w;
  }

  /**
   * Setter: target
   * @param target Identifier of target of the edge
   */
  setTarget(target:string):void {
    this.w = target;
  }

  /**
   * Getter: label
   * @return Label of the edge
   */
  getLabel():string {
    return this.value['label'] || '';
  }

  /**
   * Setter: label
   * @param label Label of the edge
   */
  setLabel(label:string):void {
    this.value['label'] = label;
  }

  /**
   * Generic getter
   * @param property Property to be retrieved
   * @return Value associated to property if property exists, null otherwise
   */
  get(property:string):any {
    return this.value[property] || null;
  }

  /**
   * Generic setter
   * @param property Property for which new value must be set
   * @param value New value to associate with property
   */
  set(property:string, value:any):void {
    this.value[property] = value;
  }
}
