import { Resource } from './resource.model';

/**
 * Helper structure to create a confirmation flow before to change the email address used for login.
 *
 * Table: `idea_projects_emailChangeRequests`.
 */
export class EmailChangeRequest extends Resource {
  /**
   * The project where the user is part of.
   */
  public project: string;
  /**
   * The code that the user has to send to confirm the new email address.
   */
  public confirmationCode: string;
  /**
   * The old email, to change.
   */
  public oldEmail: string;
  /**
   * The new email address that the user wants to set.
   */
  public newEmail: string;
  /**
   * Expiration time, in seconds.
   */
  public expiresAt: number;

  public load(x: any) {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.confirmationCode = this.clean(x.confirmationCode, String);
    this.oldEmail = this.clean(x.oldEmail, String);
    this.newEmail = this.clean(x.newEmail, String);
    this.expiresAt = this.clean(x.expiresAt, Number, Date.now() + 3600 * 24 * 30); // 1 month from now
  }
}
