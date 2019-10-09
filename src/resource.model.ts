import { isEmpty } from './utils';

/**
 * An abstract class to inherit to manage a resource model.
 */
export abstract class Resource {
  /**
   * Object initialization, setting all the default values.
   *
   * Typical implementation:
   *  ```
   *  super();
   *  this.attr = null;
   *  // ...
   *  ```
   */
  constructor() {}

  /**
   * Load the attributes from an already existing resource.
   *
   * @param newData the data to load
   *
   * Typical implementation:
   *  ```
   *  super.load(newData);
   *  this.attr = newData.attr || null;
   *  // ...
   *  ```
   */
  public load(newData: any) {
    newData = newData || {};
  }

  /**
   * Load the attributes from an already existing resource and then force some attributes to assume _safeData_ values.
   *
   * The function is usually used in the back-end to mix together back-end data with new data, without the risk of
   * changing ids and other attributes which are managed standalone.
   *
   * @param newData the data to load
   * @param safeData the attributes to force to certain values
   *
   * Typical implementation:
   *  ```
   *  super.safeLoad(newData, safeData);
   *  this.keyAttr = safeData.keyAttr;
   *  this.importantAttr = safeData.importantAttr;
   *  this.isDraft = safeData.isDraft;
   *  // ...
   *  ```
   */
  public safeLoad(newData: any, safeData: any) {
    safeData = safeData = {};
    this.load(newData);
  }

  /**
   * Valide the object's attributes, performing all the checkings.
   * @returns errors; if empty, the checkings are successfully passed,
   *
   * Typical implementation:
   *  ```
   *  const e = super.validate();
   *  if(this.iE(this.attr)) e.push(`attr`);
   *  // ...
   *  return e;
   *  ```
   */
  public validate(): Array<string> {
    return new Array<string>();
  }

  /**
   * Shortcut to Utils.isEmpty.
   */
  public iE(field: any, type?: string): boolean {
    return isEmpty(field, type);
  }

  /**
   * Return an attribute in a standard that force-cast the element.
   * @param origin the origin attribute, to cast
   * @param castFunction the cast function, e.g. `Boolean`, `Number`, `String`, `x => new CustomClass(x)`, etc.
   * @param defaultVal if set, return the value instead of `null`
   * @return cleaned attribute
   */
  public clean(origin: any, castFunction: (x: any) => any, defaultVal?: any) {
    if (Array.isArray(origin)) return this.cleanArray(origin, castFunction);
    if (castFunction === Boolean) return Boolean(origin);
    else return origin ? castFunction(origin) : defaultVal || null;
  }

  /**
   * Return an array in a standard that cast each element, keeping only the valid ones.
   * @param origin the origin array, to cast and check
   * @param castFunction the cast function, e.g. `x => String(x)` or `x => new CustomClass(x)`
   * @param defaultVal if set, return set the element value accordingly, instead of `null`
   * @return cleaned array
   */
  public cleanArray(origin: Array<any>, castFunction: (x: any) => any, defaultVal?: any) {
    return (origin || []).map(x => (x ? castFunction(x) : defaultVal || null)).filter(x => x);
  }
}
