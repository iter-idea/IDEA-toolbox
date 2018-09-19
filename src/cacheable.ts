import { epochDateTime } from './epoch';

export interface Cacheable {
  /**
   * "Modified at" information on the resource.
   */
  mAt: epochDateTime;
}