import { isEmpty, isEmptyFieldTypes } from './utils';

/**
 * An abstract class to inherit to manage a resource model.
 */
export abstract class Resource {
  /**
   * Object initialization, setting all the default values.
   * @param newData the data to load, optional
   * @param options custom options to apply; they will depend on the child resource
   *
   * Usually, there is no need to implement the constructor; implicitly, it will call the `load` of the child resource
   * and therefore loading all the resources with default values.
   * If needed, this is the suggested implementation:
   *  ```
   *  super();
   *  this.load(x);
   *  // ...
   *  ```
   */
  constructor(newData?: any, options?: any) {
    newData = newData ?? {};
    options = options ?? {};
    this.load(newData, options);
  }

  /**
   * Load the attributes from an already existing resource.
   * @param newData the data to load
   * @param options custom options to apply; they will depend on the child resource
   *
   * Typical implementation:
   *  ```
   *  super.load(newData);
   *  this.attr = this.clean(newData.attr, String);
   *  this.attr2 = this.clean(newData.attr2, Number, 0);
   *  this.attr3 = this.clean(newData.attr3, a => new Date(a), Date.now());
   *  this.arr = this.cleanArray(arr, String);
   *  // ...
   *  ```
   */
  load(newData: any, options?: any): void {
    newData = newData ?? {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options = options ?? {};
  }

  /**
   * Load the attributes from an already existing resource and then force some attributes to assume _safeData_ values.
   * The function is usually used in the back-end to mix together db data with new data, without the risk of changing
   * ids and other attributes which are managed in appositely curated scenario.
   * @param newData the data to load
   * @param safeData the attributes to force to specific values
   * @param options custom options to apply; they will depend on the child resource
   *
   * Typical implementation:
   *  ```
   *  super.safeLoad(newData, safeData);
   *  this.keyAttr = safeData.keyAttr;
   *  this.importantAttr = safeData.importantAttr;
   *  this.isDraft = safeData.isDraft;
   *  // ...
   *  ```
   *  _Note well_: there is no need to call `this.load()`, since it's implicitly called from `super.safeLoad()`,
   *  which will anyway use the child version of the method.
   */
  safeLoad(newData: any, safeData: any, options?: any): void {
    newData = newData ?? {};
    safeData = safeData ?? {};
    options = options ?? {};
    this.load(newData, options);
  }

  /**
   * Valide the object's attributes, performing all the checkings.
   * @param options custom options to apply; they will depend on the implementations
   * @return errors if empty, the checkings are successfully passed.
   *
   * Typical implementation:
   *  ```
   *  const e = super.validate();
   *  if(this.iE(this.attr)) e.push(`attr`);
   *  // ...
   *  return e;
   *  ```
   */
  validate(options?: any): string[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options = options || {};
    return [];
  }

  /**
   * Shortcut to Utils.isEmpty to check the emptiness of a field.
   */
  iE(field: any, type?: isEmptyFieldTypes): boolean {
    return isEmpty(field, type);
  }

  /**
   * Return an attribute in a cleaned standard that force-cast the element.
   * @param origin the origin attribute, to cast
   * @param castFunction the cast function, e.g. `Boolean`, `Number`, `String`, `x => new CustomClass(x)`, etc.
   * @param defaultVal if set, the fallback value instead of `null`
   * @return cleaned attribute
   */
  clean(origin: any, castFunction: (x: any) => any, defaultVal?: any): any {
    if (Array.isArray(origin)) return this.cleanArray(origin, castFunction);
    if (castFunction === Boolean) return Boolean(origin);
    else
      return origin || origin === 0 || origin === false
        ? castFunction(origin)
        : defaultVal !== undefined
        ? defaultVal
        : null;
  }

  /**
   * Return an array in a cleaned standard that force-cast each element, keeping only the valid ones.
   * @param origin the origin array, to cast and check
   * @param castFunction the cast function, e.g. `x => String(x)` or `x => new CustomClass(x)`
   * @param defaultVal if set, the fallback value instead of `null`
   * @return cleaned array
   */
  cleanArray(origin: any[], castFunction: (x: any) => any, defaultVal?: any): any[] {
    return (origin || [])
      .map(x => (x || x === 0 || x === false ? castFunction(x) : defaultVal !== undefined ? defaultVal : null))
      .filter(x => x || x === 0 || x === false);
  }
}
