import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import { MembershipSummary } from './membership.model';

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
  resourceCenterId: string;
  /**
   * The id of the folder.
   */
  folderId: string;
  /**
   * The name of the folder.
   */
  name: string;
  /**
   * Timestamp of when the folder has been created.
   */
  createdAt: epochDateTime;
  /**
   * The user who created the folder.
   */
  createdBy: MembershipSummary;
  /**
   * Timestamp of last update.
   */
  updatedAt?: epochDateTime;
  /**
   * The user who lastly updated the folder.
   */
  updatedBy?: MembershipSummary;

  load(x: any): void {
    super.load(x);
    this.resourceCenterId = this.clean(x.resourceCenterId, String);
    this.folderId = this.clean(x.folderId, String);
    this.name = this.clean(x.name, String);
    this.createdAt = this.clean(x.createdAt, d => new Date(d).getTime(), Date.now());
    this.createdBy = new MembershipSummary(x.createdBy);
    if (x.updatedAt) this.updatedAt = this.clean(x.updatedAt, d => new Date(d).getTime());
    if (x.updatedBy) this.updatedBy = new MembershipSummary(x.updatedBy);
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.resourceCenterId = safeData.resourceCenterId;
    this.folderId = safeData.folderId;
    this.createdAt = safeData.createdAt;
    this.createdBy = safeData.createdBy;
    this.updatedAt = safeData.updatedAt;
    this.updatedBy = safeData.updatedBy;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    return e;
  }
}
