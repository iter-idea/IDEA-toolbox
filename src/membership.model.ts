import { Resource } from './resource.model';

/**
 * Table: `idea_teams_users`.
 *
 * Indexes:
 *    - `userId-index`.
 */
export class Membership extends Resource {
  /**
   * The id of the team.
   */
  public teamId: string;
  /**
   * The id of the user (Cognito sub).
   */
  public userId: string;
  /**
   * The name of the user in the team.
   */
  public name: string;
  /**
   * If `false`, the user joined the team.
   */
  public pendingInvitation: boolean;
  /**
   * The permissions of the user on the team.
   */
  public permissions: TeamPermissions;

  public load(x: any) {
    super.load(x);
    this.teamId = this.clean(x.teamId, String);
    this.userId = this.clean(x.userId, String);
    this.name = this.clean(x.name, String);
    this.pendingInvitation = this.clean(x.teamId, Boolean);
    this.permissions = new TeamPermissions(x.permissions);
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.teamId = safeData.teamId;
    this.userId = safeData.userId;
    this.pendingInvitation = safeData.pendingInvitation;
    this.permissions = safeData.permissions;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    return e;
  }
}
export class TeamPermissions extends Resource {
  /**
   * The possible setting are always boolean. Enable the index access.
   */
  [key: string]: boolean | any;
  /**
   * Can manage the team and its members.
   */
  public admin: boolean;

  public load(x: any) {
    super.load(x);
    this.admin = this.clean(x.admin, Boolean);
  }
}
