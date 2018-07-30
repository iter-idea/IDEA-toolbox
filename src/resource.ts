/**
 * An abstract class to inherit to manage a resource model.
 */
export abstract class Resource {
  /**
   * Object initialization, with a bulk set of its attributes.
   * @param {any} attributes the attributes, except the keys
   * @param {any} keys the keys to set
   */
  constructor(attributes?: any, keys?: any) {
    if(keys) {
      // e.g. this.keyAttr = keys.keyAttr || null;
      // ...
    }
    attributes = attributes || {};
    // e.g. this.attr = attributes.attr || null;
    // ...
  }
  
  /**
   * Valide the object's attributes, performing all the checkings.
   * @return {Array<string>} errors; if empty, the checkings are passed
   */
  public abstract validate(): Array<string>;
}