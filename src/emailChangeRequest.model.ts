/**
 * Helper structure to create a confirmation flow before to change the email address used for login.
 *
 * Table: `idea_projects_emailChangeRequests`.
 */
export interface EmailChangeRequest {
  /**
   * The project where the user is part of.
   */
  project: string;
  /**
   * The code that the user has to send to confirm the new email address.
   */
  confirmationCode: string;
  /**
   * The old email, to change.
   */
  oldEmail: string;
  /**
   * The new email address that the user wants to set.
   */
  newEmail: string;
  /**
   * Expiration time, in seconds.
   */
  expiresAt: number;
}
