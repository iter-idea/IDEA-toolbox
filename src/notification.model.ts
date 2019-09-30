export interface Notification {
  /**
   * The id of the team owner of the notification. Useful for branded notifications.
   */
  teamId?: string;
  /**
   * The id of the user receiver.
   * Either userId or email must be set.
   */
  userId?: string;
  /**
   * In case the user doesn't exist (!userId), the email address to which send an email notification.
   * Either email or userId must be set.
   */
  email?: string;
  /**
   * A brief description of the notification.
   */
  subject: string;
  /**
   * The content of the notification; markdown support.
   */
  content: string;
  /**
   * If set, an email notification is preferred to any other channel.
   */
  forceEmail?: boolean;
}
