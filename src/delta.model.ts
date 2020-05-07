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
 */
export class DeltaRecord extends Resource {
  /**
   * The concatenation of teamId and resource.
   */
  public teamResource: string;
  /**
   * The id of the record; it could be a concatenation of the element ids.
   */
  public id: string;
  /**
   * The timestamp when the record was lastly updated.
   */
  public timestamp: epochDateTime;
  /**
   * If set, the record shows the element was deleted.
   */
  public deleted?: boolean;
  /**
   * The current state of the element, if not deleted.
   */
  public element?: any;

  public load(x?: any) {
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
  public since: epochDateTime;
  /**
   * If set, there are more resesources to acquire, so it contains the link to request another page.
   */
  public next?: string;
  /**
   * The list of resources involved in this delta.
   */
  public resources: Array<DeltaResources | string>;
  /**
   * The list of delta records for each resource.
   */
  public records: { [resource: string]: Array<DeltaRecord> };

  public load(x: any) {
    super.load(x);
    this.since = this.clean(x.since, Number, 0) as epochDateTime;
    if (x.next) this.next = this.clean(x.next, String);
    this.resources = this.cleanArray(x.resources, String) as Array<DeltaResources | string>;
    this.records = {};
    if (x.records) this.resources.forEach(r => this.cleanArray(x.records[r], y => new DeltaRecord(y)));
  }

  /**
   * Set the records of a resource to the delta.
   */
  public setRecordsOfResource(records: Array<DeltaRecord>, resource: DeltaResources | string) {
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
  public resources: Array<DeltaResources | string>;
  /**
   * The lastEvaluatedKeys for getting the next page of the pagination, for each resources.
   */
  public keys: { [resource: string]: any };

  public load(x: any) {
    super.load(x);
    this.resources = this.cleanArray(x.resources, String) as Array<DeltaResources | string>;
    this.keys = {};
    if (x.keys) this.resources.forEach(r => (this.keys[r] = x.keys[r] || null));
  }

  /**
   * Add the keys of a resource to the DeltaNext.
   */
  public addKeyOfResource(key: { [resource: string]: any }, resource: DeltaResources | string) {
    if (!this.resources.some(r => r === resource)) this.resources.push(resource);
    this.keys[resource] = key;
  }

  /**
   * Remove a resource from the structure.
   */
  public removeResource(resource: DeltaResources | string) {
    delete this.keys[resource];
    this.resources.splice(this.resources.indexOf(resource), 1);
  }

  /**
   * Whether the DeltaNext is needed; it depends if there are still resources to be managed.
   */
  public isNeeded() {
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
