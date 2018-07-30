/**
 * An abstract class to inherit to manage a resource model.
 */
export abstract class Resource {
  /**
   * Object initialization, setting all the default values.
   */
  constructor() {}

  /**
   * Load the attributes from an already existent resource.
   * 
   * @param {any} newData the data to load
   * 
   * Typical implementation:
     ```
     newData = newData || {};
     // ...
     this.attr = newData.attr || null;
     // ...
     ```
   */
  public abstract load(newData: any): void;

  /**
   * Load the attributes from an already existent resource and then force some attributes 
   * to assume _safeData_ values.
   * 
   * The function is usually used in the back-end to mix together back-end data with new data,
   * without the risk of the changing of ids and other attributes which are managed standalone.
   * 
   * @param {any} newData the data to load
   * @param {any} safeData the attributes to force to certain values
   * 
   * Typical implementation:
     ```
     this.load(newData);
     // ...
     this.keyAttr = safeData.keyAttr;
     this.importantAttr = safeData.importantAttr;
     this.isDraft = safeData.isDraft;
     // ...
     ```
   */
  public abstract safeLoad(newData: any, safeData: any): void;

  /**
   * Valide the object's attributes, performing all the checkings.
   * @returns {Array<string>} errors; if empty, the checkings are passed
   * 
   * Typical implementation:
     ```
     let iE = Utils.isEmpty; // from idea-toolbox
     let e: Array<string> = new Array<string>();
     // ...
     if(iE(this.attr)) e.push(`attr`);
     // ...
     return e;
     ```
   */
  public abstract validate(): Array<string>;
}