import { Resource } from './resource.model';
import { markdown } from './markdown';

/**
 * An object to pass to SNS topics that manage notifications.
 */
export class Notification extends Resource {
  /**
   * The project from which we fire the notification.
   */
  project: string;
  /**
   * A brief description of the notification.
   */
  subject: string;
  /**
   * The content of the notification.
   */
  content: markdown;
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
   * If set, an email notification is preferred to any other channel.
   */
  forceEmail?: boolean;
  /**
   * The event that triggered the notification; useful to gather specific notification preferences.
   */
  event?: string;

  load(x: any): void {
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
  email: boolean;
  /**
   * Whether to receive a push notification.
   */
  push: boolean;

  load(x?: any): void {
    super.load(x);
    this.email = this.clean(x.email, Boolean, true);
    this.push = this.clean(x.push, Boolean, true);
  }
}
