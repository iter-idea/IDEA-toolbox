import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * A team's Resource Center folder.
 *
 * Table: `idea_resourceCenters_folders`.
 *
 * Indexes:
 *    - `resourceCenterId-name-index`; includes: ALL.
 */
export class RCFolder extends Resource {
  /**
   * The id of the resource center (as collection of folders managed by a team).
   * Usually the concatenation of project and team id (`project_teamId`), but open to custom scenarios.
   */
  public resourceCenterId: string;
  /**
   * The id of the folder.
   */
  public folderId: string;
  /**
   * The name of the folder.
   */
  public name: string;
  /**
   * Timestamp of when the folder has been created.
   */
  public createdAt: epochDateTime;
  /**
   * Timestamp of when the last update on one of its resources happened.
   */
  public updatedAt: epochDateTime;

  constructor(x?: RCFolder | any) {
    super();
    this.resourceCenterId = null;
    this.folderId = null;
    this.name = null;
    this.createdAt = Date.now();
    this.updatedAt = null;
    if (x) this.load(x);
  }

  public load(x: any) {
    super.load(x);
    this.resourceCenterId = this.clean(x.resourceCenterId, String);
    this.folderId = this.clean(x.folderId, String);
    this.name = this.clean(x.name, String);
    this.createdAt = this.clean(x.createdAt, a => new Date(a).getTime(), Date.now());
    this.updatedAt = this.clean(x.updatedAt, a => new Date(a).getTime());
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.resourceCenterId = safeData.resourceCenterId;
    this.folderId = safeData.folderId;
    this.createdAt = safeData.createdAt;
    this.updatedAt = safeData.updatedAt;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.name)) e.push(`name`);
    return e;
  }
}
