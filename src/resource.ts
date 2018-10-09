import { Cacheable } from './cacheable';
import { epochDateTime } from './epoch';
import { isEmpty } from './utils';

/**
 * An abstract class to inherit to manage a resource model.
 */
export abstract class Resource implements Cacheable {
  /**
   * "Modified at" information on the resource.
   */
  public mAt: epochDateTime;

  /**
   * Object initialization, setting all the default values.
   *
   * Typical implementation:
     ```
     super();
     this.attr = null;
     // ...
     ```
   */
  constructor() {
    this.mAt = null;
  }

  /**
   * Update `mAt` after a change in the object.
   */
  public tick(): void {
    this.mAt = new Date().getTime();
  }

  /**
   * Load the attributes from an already existent resource.
   *
   * @param {any} newData the data to load
   *
   * Typical implementation:
     ```
     super.load(newData);
     this.attr = newData.attr || null;
     // ...
     ```
   */
  public load(newData: any): void {
    newData = newData || {};
  };

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
     super.safeLoad(newData, safeData);
     this.keyAttr = safeData.keyAttr;
     this.importantAttr = safeData.importantAttr;
     this.isDraft = safeData.isDraft;
     // ...
     ```
   */
  public safeLoad(newData: any, safeData: any): void {
    safeData = safeData = {};
    this.load(newData);
  };

  /**
   * Valide the object's attributes, performing all the checkings.
   * Also "ticks" the `mAt` field (useful before a put in the data model).
   * @returns {Array<string>} errors; if empty, the checkings are passed
   *
   * Typical implementation:
     ```
     let e: Array<string> = new Array<string>();
     if(this.iE(this.attr)) e.push(`attr`);
     // ...
     return e;
     ```
   */
  public validate(): Array<string> {
    this.tick();
    return new Array<string>();
  };

  /**
   * Shortcut to Utils.isEmpty.
   */
  public iE(field: any, type?: string): boolean {
    return isEmpty(field, type);
  }
}