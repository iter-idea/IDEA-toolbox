/**
 * An object to pass to SNS topics that manage notifications.
 */
export class Notification {
  /**
   * The project from which we fire the notification.
   */
  public project: string;
  /**
   * The id of the team owner of the notification. Useful for branded notifications.
   */
  public teamId?: string;
  /**
   * The id of the user receiver.
   * Either userId or email must be set.
   */
  public userId?: string;
  /**
   * In case the user doesn't exist (!userId), the email address to which send an email notification.
   * Either email or userId must be set.
   */
  public email?: string;
  /**
   * A brief description of the notification.
   */
  public subject: string;
  /**
   * The content of the notification; markdown support.
   */
  public content: string;
  /**
   * If set, an email notification is preferred to any other channel.
   */
  public forceEmail?: boolean;

  constructor(x?: Notification | any) {
    x = (x || {}) as Notification;
    this.project = x.project ? String(x.project) : null;
    this.teamId = x.teamId ? String(x.teamId) : null;
    this.userId = x.userId ? String(x.userId) : null;
    this.email = x.email ? String(x.email) : null;
    this.subject = x.subject ? String(x.subject) : null;
    this.content = x.content ? String(x.content) : null;
    this.forceEmail = Boolean(x.forceEmail);
  }
}

/**
 * Preferences for receiving notifications.
 */
export class NotificationsPreferences {
  /**
   * If true, always send an email.
   */
  public email: boolean;
  /**
   * If true, always send a push notification.
   */
  public push: boolean;

  constructor(x?: NotificationsPreferences | any) {
    x = (x || {}) as NotificationsPreferences;
    this.email = Boolean(x.email);
    this.push = Boolean(x.push);
  }
}
