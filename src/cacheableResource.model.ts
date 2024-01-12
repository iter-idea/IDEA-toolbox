import { Cacheable } from './cacheable.model';
import { epochDateTime } from './epoch';
import { Resource } from './resource.model';

/**
 * An abstract class to inherit to manage a resource model.
 * @deprecated
 */
export abstract class CacheableResource extends Resource implements Cacheable {
  /**
   * "Modified at" information on the resource.
   */
  mAt: epochDateTime;

  constructor(x?: any, options?: any) {
    super(x, options);
    this.mAt = Date.now();
  }

  /**
   * Update `mAt` after a change in the object.
   */
  tick(): void {
    this.mAt = Date.now();
  }

  validate(options?: any): string[] {
    const e = super.validate(options);
    this.tick();
    return e;
  }
}
