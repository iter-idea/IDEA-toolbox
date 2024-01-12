import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import { MembershipSummary } from './membership.model';
import { loopStringEnumValues } from './utils';

/**
 * A team's Resource Center resource.
 *
 * Table: `idea_resourceCentersFolders_resources`.
 *
 * Indexes:
 *    - `resourceCenterFolderId-name-index`; includes: ALL.
 */
export class RCResource extends Resource {
  /**
   * Concatenation of resourceCenter and folder id (`resourceCenterId_folderId`).
   */
  resourceCenterFolderId: string;
  /**
   * The id of the resource.
   */
  resourceId: string;
  /**
   * The folder of the resource.
   */
  folderId: string;
  /**
   * The name of the resource. This can be changed when attaching to the entity.
   */
  name: string;
  /**
   * The format of the resource (e.g. 'jpg', 'pdf').
   */
  format: RCResourceFormats;
  /**
   * Timestamp of when the resource has been uploaded the last time.
   */
  version: epochDateTime;
  /**
   * Timestamp of when the resource has been created.
   */
  createdAt: epochDateTime;
  /**
   * The user who created the resource.
   */
  createdBy: MembershipSummary;
  /**
   * Timestamp of last update.
   */
  updatedAt?: epochDateTime;
  /**
   * The user who lastly updated the resource.
   */
  updatedBy?: MembershipSummary;

  load(x: any): void {
    super.load(x);
    this.resourceCenterFolderId = this.clean(x.resourceCenterFolderId, String);
    this.resourceId = this.clean(x.resourceId, String);
    this.folderId = this.clean(x.folderId, String);
    this.name = this.clean(x.name, String);
    this.format = this.clean(x.format, String) as RCResourceFormats;
    this.version = this.clean(x.version, a => new Date(a).getTime());
    this.createdAt = this.clean(x.createdAt, d => new Date(d).getTime(), Date.now());
    this.createdBy = new MembershipSummary(x.createdBy);
    if (x.updatedAt) this.updatedAt = this.clean(x.updatedAt, d => new Date(d).getTime());
    if (x.updatedBy) this.updatedBy = new MembershipSummary(x.updatedBy);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.resourceCenterFolderId = safeData.resourceCenterFolderId;
    this.resourceId = safeData.resourceId;
    this.folderId = safeData.folderId;
    this.version = safeData.version;
    this.createdAt = safeData.createdAt;
    this.createdBy = safeData.createdBy;
    this.updatedAt = safeData.updatedAt;
    this.updatedBy = safeData.updatedBy;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    if (!loopStringEnumValues(RCResourceFormats).some(x => x === this.format)) e.push('format');
    return e;
  }
}

/**
 * The allowed formats for a resource.
 */
export enum RCResourceFormats {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  PDF = 'pdf'
}
