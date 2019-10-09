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

  public load(x: any) {
    super.load(x);
    this.resourceCenterFolderId = this.clean(x.resourceCenterFolderId, String);
    this.resourceId = this.clean(x.resourceId, String);
    this.folderId = this.clean(x.folderId, String);
    this.name = this.clean(x.name, String);
    this.format = this.clean(x.format, String);
    this.version = this.clean(x.version, a => new Date(a).getTime());
    this.createdAt = this.clean(x.createdAt, a => new Date(a).getTime(), Date.now());
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
