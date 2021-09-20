import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * A Resource Center's resource attached to other Objects.
 */
export class RCAttachedResource extends Resource {
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
   * The original name of the file.
   */
  originalName: string;
  /**
   * The format of the resource. (e.g. 'jpg', 'pdf').
   */
  format: string;
  /**
   * Timestamp of the latest version of the resource at the time it was attached to the entity.
   */
  version: epochDateTime;

  load(x: any) {
    super.load(x);
    this.resourceId = this.clean(x.resourceId, String);
    this.folderId = this.clean(x.folderId, String);
    this.name = this.clean(x.name, String);
    this.originalName = this.clean(x.originalName, String, this.name);
    this.format = this.clean(x.format, String);
    this.version = this.clean(x.version, a => new Date(a).getTime(), Date.now());
  }

  safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.resourceId = safeData.resourceId;
    this.folderId = safeData.folderId;
    this.originalName = safeData.originalName;
    this.format = safeData.format;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    return e;
  }
}
