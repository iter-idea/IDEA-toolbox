/**
 * An abstract class to inherit to manage a resource model.
 */
export abstract class Resource {
  /**
   * Object initialization, with a bulk set of its attributes.
   * @param {any} attributes
   */
  constructor(attributes?: any) {
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