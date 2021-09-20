import { epochDateTime } from './epoch';

/**
 * @deprecated
 */
export interface Cacheable {
  /**
   * "Modified at" information on the resource.
   */
  mAt: epochDateTime;

  /**
   * Updated `mAt` after a change in the object.
   */
  tick(): void;
}
