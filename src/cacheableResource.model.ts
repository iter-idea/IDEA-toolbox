import { Cacheable } from './cacheable.model';
import { epochDateTime } from './epoch';
import { Resource } from './resource.model';

/**
 * An abstract class to inherit to manage a resource model.
 */
export abstract class CacheableResource extends Resource implements Cacheable {
  /**
   * "Modified at" information on the resource.
   */
  public mAt: epochDateTime;

  constructor() {
    super();
    this.mAt = Date.now();
  }

  /**
   * Update `mAt` after a change in the object.
   */
  public tick() {
    this.mAt = Date.now();
  }

  public validate(): Array<string> {
    const e = super.validate();
    this.tick();
    return e;
  }
}
