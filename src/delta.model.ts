import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * A record for the Delta mechanism.
 * It shows the latest state of a particular resource element.
 *
 * Table: `xxx_teamsResources_delta`.
 *
 * Indexes:
 *   - `teamResource-timestamp-index`; LSI, includes: deleted, element.
 *   - `teamResource-timestamp-count`; LSI, includes: deleted.
 */
export class DeltaRecord extends Resource {
  /**
   * The concatenation of teamId and resource.
   */
  teamResource: string;
  /**
   * The id of the record; it could be a concatenation of the element ids.
   */
  id: string;
  /**
   * The timestamp when the record was lastly updated.
   */
  timestamp: epochDateTime;
  /**
   * If set, the record shows the element was deleted.
   */
  deleted?: boolean;
  /**
   * The current state of the element, if not deleted.
   */
  element?: any;

  load(x?: any): void {
    super.load(x);
    this.teamResource = this.clean(x.teamResource, String);
    this.id = this.clean(x.id, String);
    this.timestamp = this.clean(x.timestamp, Number) as epochDateTime;
    if (x.deleted) this.deleted = this.clean(x.deleted, Boolean);
    if (x.element) this.element = x.element || {};
  }
}

/**
 * A structure to manage the delta (changes since a timestamp) of a set of resources.
 */
export class Delta extends Resource {
  /**
   * Starting time to confront what's changed since then.
   */
  since: epochDateTime;
  /**
   * If set, there are more resesources to acquire, so it contains the link to request another page.
   */
  next?: string;
  /**
   * The list of resources involved in this delta.
   */
  resources: (DeltaResources | string)[];
  /**
   * The list of delta records for each resource.
   */
  records: { [resource: string]: DeltaRecord[] };

  load(x: any): void {
    super.load(x);
    this.since = this.clean(x.since, Number, 0) as epochDateTime;
    if (x.next) this.next = this.clean(x.next, String);
    this.resources = this.cleanArray(x.resources, String) as (DeltaResources | string)[];
    this.records = {};
    if (x.records) this.resources.forEach(r => this.cleanArray(x.records[r], y => new DeltaRecord(y)));
  }

  /**
   * Set the records of a resource to the delta.
   */
  setRecordsOfResource(records: DeltaRecord[], resource: DeltaResources | string): void {
    if (!this.resources.some(r => r === resource)) this.resources.push(resource);
    this.records[resource] = records;
  }
}

/**
 * The structure to have the next page of a previous delta request.
 */
export class DeltaNext extends Resource {
  /**
   * The resources of which there is still data to acquire.
   */
  resources: (DeltaResources | string)[];
  /**
   * The lastEvaluatedKeys for getting the next page of the pagination, for each resources.
   */
  keys: { [resource: string]: any };

  load(x: any): void {
    super.load(x);
    this.resources = this.cleanArray(x.resources, String) as (DeltaResources | string)[];
    this.keys = {};
    if (x.keys) this.resources.forEach(r => (this.keys[r] = x.keys[r] || null));
  }

  /**
   * Add the keys of a resource to the DeltaNext.
   */
  addKeyOfResource(key: { [resource: string]: any }, resource: DeltaResources | string): void {
    if (!this.resources.some(r => r === resource)) this.resources.push(resource);
    this.keys[resource] = key;
  }

  /**
   * Remove a resource from the structure.
   */
  removeResource(resource: DeltaResources | string): void {
    delete this.keys[resource];
    this.resources.splice(this.resources.indexOf(resource), 1);
  }

  /**
   * Whether the DeltaNext is needed; it depends if there are still resources to be managed.
   */
  isNeeded(): number {
    return this.resources.length;
  }
}

/**
 * The resources supporting the delta mechanism.
 * Create a similar structure when implementing the delta in a project.
 */
export enum DeltaResources {
  RESOURCE = 'RESOURCE'
}

/**
 * A structure to have an overview of the number of elements for each resource.
 */
export class DeltaCount extends Resource {
  /**
   * Starting time to confront what's changed since then.
   */
  since: epochDateTime;
  /**
   * The list of resources involved in this delta.
   */
  resources: (DeltaResources | string)[];
  /**
   * The count of elements for each resource.
   */
  count: { [resource: string]: number };

  load(x: any): void {
    super.load(x);
    this.since = this.clean(x.since, Number, 0) as epochDateTime;
    this.resources = this.cleanArray(x.resources, String) as (DeltaResources | string)[];
    this.count = {};
    if (x.count) this.resources.forEach(r => this.clean(x.count[r], Number));
  }
}
