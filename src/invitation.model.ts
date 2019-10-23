import { Resource } from './resource.model';

/**
 * Table: `idea_invitations`.
 *
 * Indexes:
 *   - `email-index` (all).
 */
export class Invitation extends Resource {
  /**
   * Unique, random invitation code (partition key).
   */
  public invitationCode: string;
  /**
   * Team id.
   */
  public teamId: string;
  /**
   * The email address of the invited user.
   * Note: we use it instead of the userId to invite also not-users of the platform.
   */
  public email: string;
  /**
   * Expiration time, in seconds.
   */
  public expiresAt: number;

  public load(x: any) {
    super.load(x);
    this.invitationCode = this.clean(x.invitationCode, String);
    this.teamId = this.clean(x.teamId, String);
    this.email = this.clean(x.email, String);
    this.expiresAt = this.clean(x.expiresAt, Number);
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.invitationCode = safeData.invitationCode;
    this.teamId = safeData.teamId;
    this.email = safeData.email;
    this.expiresAt = safeData.expiresAt;
  }
}
