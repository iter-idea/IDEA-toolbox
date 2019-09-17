import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * A Resource Center's resource attached to other Objects.
 */
export class RCAttachedResource extends Resource {
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
   * The original name of the file.
   */
  public originalName: string;
  /**
   * The format of the resource. (e.g. 'jpg', 'pdf').
   */
  public format: string;
  /**
   * Timestamp of the latest version of the resource at the time it was attached to the entity.
   */
  public version: epochDateTime;

  constructor(x?: RCAttachedResource | any) {
    super();
    this.resourceId = null;
    this.folderId = null;
    this.name = null;
    this.originalName = null;
    this.format = null;
    this.version = null;
    if (x) this.load(x);
  }

  public load(x: any) {
    super.load(x);
    this.resourceId = x.resourceId ? String(x.resourceId) : null;
    this.folderId = x.folderId ? String(x.folderId) : null;
    this.name = x.name ? String(x.name) : null;
    this.originalName = x.originalName ? String(x.originalName) : null;
    this.format = x.format ? String(x.format) : null;
    this.version = x.version ? new Date(x.version).getTime() : null;
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.resourceId = safeData.resourceId;
    this.folderId = safeData.folderId;
    this.originalName = safeData.originalName;
    this.format = safeData.format;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.name)) e.push(`name`);
    return e;
  }
}
