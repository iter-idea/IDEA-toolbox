import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

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
  public resourceCenterFolderId: string;
  /**
   * The id of the resource.
   */
  public resourceId: string;
  /**
   * The folder of the resource.
   */
  public folderId: string;
  /**
   * The name of the resource. This can be changed when attaching to the entity.
   */
  public name: string;
  /**
   * The format of the resource. (e.g. 'jpg', 'pdf').
   */
  public format: string;
  /**
   * Timestamp of when the resource has been uploaded the last time.
   */
  public version: epochDateTime;
  /**
   * Timestamp of when the resource has been created.
   */
  public createdAt: epochDateTime;

  constructor(x?: RCResource | any) {
    super();
    this.resourceCenterFolderId = null;
    this.resourceId = null;
    this.folderId = null;
    this.name = null;
    this.version = null;
    this.createdAt = Date.now();
    this.format = null;
    if (x) this.load(x);
  }

  public load(x: any) {
    super.load(x);
    this.resourceCenterFolderId = x.resourceCenterFolderId ? String(x.resourceCenterFolderId) : null;
    this.resourceId = x.resourceId ? String(x.resourceId) : null;
    this.folderId = x.folderId ? String(x.folderId) : null;
    this.name = x.name ? String(x.name) : null;
    this.format = x.format ? String(x.format) : null;
    this.version = x.version ? new Date(x.version).getTime() : null;
    this.createdAt = x.createdAt ? new Date(x.createdAt).getTime() : null;
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.resourceCenterFolderId = safeData.resourceCenterFolderId;
    this.resourceId = safeData.resourceId;
    this.folderId = safeData.folderId;
    this.format = safeData.format;
    this.createdAt = safeData.createdAt;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.name)) e.push(`name`);
    return e;
  }
}
