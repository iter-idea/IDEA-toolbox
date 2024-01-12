import { Resource } from './resource.model';

/**
 * This class serve two purposes:
 *  1. To represent the resource IDEA Membership, which is stored in the table below.
 *  2. To give a generic representation to the concept of Membership in IDEA's project.
 *
 * Table: `idea_teams_users`.
 *
 * Indexes:
 *    - `userId-index`.
 */
export class Membership extends Resource {
  /**
   * The id of the team.
   */
  teamId: string;
  /**
   * The id of the user (Cognito sub).
   */
  userId: string;
  /**
   * The name of the user in the team.
   * In generic scenarios, it's usually the user's email address.
   */
  name: string;
  /**
   * If set, a short representation of the name, through initials.
   */
  initials?: string;
  /**
   * Whether the user has still to accept the invitation to join the team.
   */
  pendingInvitation?: boolean;

  load(x: any): void {
    super.load(x);
    this.teamId = this.clean(x.teamId, String);
    this.userId = this.clean(x.userId, String);
    this.name = this.clean(x.name, String);
    if (x.initials) this.initials = this.clean(x.initials, String);
    if (x.pendingInvitation) this.pendingInvitation = true;
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.teamId = safeData.teamId;
    this.userId = safeData.userId;
    if (safeData.pendingInvitation) this.pendingInvitation = safeData.pendingInvitation;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    return e;
  }
}

/**
 * Minimal info on the membership, to attach to other entities.
 */
export class MembershipSummary extends Resource {
  /**
   * The id of the member of the team.
   */
  userId: string;
  /**
   * The name of the member of the team.
   * In generic scenarios, it's usually the user's email address.
   */
  name: string;
  /**
   * If set, a short representation of the name, through initials.
   */
  initials?: string;

  load(x: any): void {
    super.load(x);
    this.userId = this.clean(x.userId, String);
    this.name = this.clean(x.name, String);
    if (x.initials) this.initials = this.clean(x.initials, String);
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.userId)) e.push('userId');
    if (this.iE(this.name)) e.push('name');
    return e;
  }
}
