export class Node {
  protected v?:string;
  protected value:Object;

  /**
   * Constructor of Node
   * @param type Type of Node according to Provenance specification in context of Provenance graph, null otherwise
   * @param subType (optional) Subtype of Node (by default, null)
   * @param id (optional) Identifier of the Node (if empty, temporary identifier is created; pattern: 'temp_<UUID>' where UUID complies with V1)
   */
  constructor(id:string, type?:string, subType?:string, label?:string) {
    this.v = id;
    this.value = {};
    this.value['type'] = type || null;
    this.value['label'] = label || this.getLabel();
    this.value['subType'] = subType || null;
  }

  /**
   * Getter: identifier
   * @return Identifier of the Node
   */
  getId():string {
    return this.v;
  }

  /**
   * Setter: identifier
   * @param id Identifier of the Node
   */
  setId(id:string):void {
    this.v = id;
  }

  /**
   * Getter: type
   * @return Type of the Node
   */
  getType():string {
    return this.value['type'];
  }

  /**
   * Getter: label
   * @return Label of the Node
   */
  getLabel():string {
    return this.value['label'] || (this.value['type'] && this.value['type'].toUpperCase()) || this.v;
  }


  /**
   * Generic getter
   * @param property Property to be retrieved
   * @return Value associated to property if property exists, null otherwise
   */
  get(property:string):any {
    return this.value[property];
  }

  /**
   * Generic setter
   * @param property Property for which new value must be set
   * @param value New value to associate with property
   */
  set(property:string, value:any):void {
    this.value[property] = value;
  }

  /**
   * Appends element for given property if aforesaid property exists
  * @param property Property for which element must be appended
  * @param element Element to append
  * @param key (optional) Key if property is an Object
  */
  append(property:string, element:any, key?:string):void {
    if(this.value[property]) {
      this.appendElement(property, element, key);
    }
  }

  /**
   * Appends element for given property based on type of attribute
   * @param property Property for which element must be appended
   * @param element Element to append
   * @param key (optional) Key if property is an Object
   */
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
