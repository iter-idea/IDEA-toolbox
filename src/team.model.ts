import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * Table: `idea_teams`.
 */
export class Team extends Resource {
  /**
   * The id of the team
   */
  public teamId: string;
  /**
   * The team name.
   */
  public name: string;
  /**
   * The id of the owner.
   */
  public ownerId: string;
  /**
   * Timestamp of creation.
   */
  public createdAt: epochDateTime;
  /**
   * If true, the team has been activated by the admins for the project selected; not stored, calculated at runtime.
   */
  public isActivatedOnProject: boolean;
  /**
   * Whether the requesting user is admin of the team or not.
   */
  public isRequestingUserAdmin: boolean;

  public load(x: any) {
    super.load(x);
    this.teamId = this.clean(x.teamId, String);
    this.name = this.clean(x.name, String);
    this.ownerId = this.clean(x.ownerId, String);
    this.createdAt = this.clean(x.createdAt, d => new Date(d).getTime(), Date.now());
    this.isActivatedOnProject = this.clean(x.isActivatedOnProject, Boolean);
    this.isRequestingUserAdmin = this.clean(x.isRequestingUserAdmin, Boolean);
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.teamId = safeData.teamId;
    this.ownerId = safeData.ownerId;
    this.createdAt = safeData.createdAt;
    delete this.isActivatedOnProject; // not stored, calculated at runtime
    delete this.isRequestingUserAdmin; // not stored, calculated at runtime
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.name)) e.push(`name`);
    return e;
  }
}