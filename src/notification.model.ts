import { Resource } from './resource.model';
import { markdown } from './markdown';

/**
 * An object to pass to SNS topics that manage notifications.
 */
export class Notification extends Resource {
  /**
   * The project from which we fire the notification.
   */
  public project: string;
  /**
   * A brief description of the notification.
   */
  public subject: string;
  /**
   * The content of the notification.
   */
  public content: markdown;
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
   * If set, an email notification is preferred to any other channel.
   */
  public forceEmail?: boolean;
  /**
   * The event that triggered the notification; useful to gather specific notification preferences.
   */
  public event?: string;

  public load(x: any) {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.subject = this.clean(x.subject, String);
    this.content = this.clean(x.content, String);
    if (x.teamId) this.teamId = this.clean(x.teamId, String);
    if (x.userId) this.userId = this.clean(x.userId, String);
    if (x.email) this.email = this.clean(x.email, String);
    if (x.forceEmail) this.forceEmail = true;
    if (x.event) this.event = this.clean(x.event, String);
  }
}

/**
 * The interface for the preferences of notification (based on different events) of an IDEA project.
 */
export interface NotificationPreferences {
  /**
   * The map of events with their notification preferences.
   */
  [event: string]: EventNotificationPreference;
}

/**
 * Preferences for receiving notifications after a specific event.
 */
export class EventNotificationPreference extends Resource {
  /**
   * Whether to receive an email.
   */
  public email: boolean;
  /**
   * Whether to receive a push notification.
   */
  public push: boolean;

  public load(x?: any) {
    super.load(x);
    this.email = this.clean(x.email, Boolean, true);
    this.push = this.clean(x.push, Boolean, true);
  }
}
