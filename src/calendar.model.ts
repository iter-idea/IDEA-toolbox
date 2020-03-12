import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import Moment = require('moment-timezone');

/**
 * Representation of a calendar, which can be:
 *  - private (linked to a user) or shared (linked to a team).
 *  - linked to an external service (Microsoft, Google, etc.) or not.
 *
 * Table: `idea_calendars`.
 *
 * Indexes:
 *  - userId-name-index (all)
 *  - teamId-name-index (all)
 */
export class Calendar extends Resource {
  /**
   * The id (IUID) of the calendar.
   */
  public calendarId: string;
  /**
   * The id of the teamId owning the calendar, in case of team calendar (this cannot be changed).
   */
  public teamId?: string;
  /**
   * The id of the user owning the calendar, in case of private calendar (this cannot be changed).
   * If `teamId` is set, this attribute is ignored.
   */
  public userId?: string;
  /**
   * The name of the calendar. Max 100 characters.
   */
  public name: string;
  /**
   * The description of the calendar. Max 300 characters.
   */
  public description: string;
  /**
   * An identifying color for the calendar; e.g. `#0010AA`.
   */
  public color: string;
  /**
   * A default timezone for the calendar.
   */
  public timezone: string;
  /**
   * Extra info about the calendar, if linked to an external service.
   */
  public external?: ExternalCalendarInfo;
  /**
   * In case of shared calendar, the IDs of the users that can manage the calendar's appointments.
   * The default access for the users (not included in the list) is read-only.
   */
  public usersCanManageAppointments?: Array<string>;

  public load(x: any) {
    super.load(x);
    this.calendarId = this.clean(x.calendarId, String);
    if (x.teamId) this.teamId = this.clean(x.teamId, String);
    else if (x.userId) this.userId = this.clean(x.userId, String);
    this.name = this.clean(x.name, String);
    if (this.name) this.name = this.name.slice(0, 100);
    this.description = this.clean(x.description, String);
    if (this.description) this.description = this.description.slice(0, 300);
    this.color = this.clean(x.color, String);
    this.timezone = this.clean(x.timezone || Moment.tz.guess(), String);
    if (x.external) this.external = new ExternalCalendarInfo(x.external);
    if (x.teamId) this.usersCanManageAppointments = this.cleanArray(x.usersCanManageAppointments, String);
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.calendarId = safeData.calendarId;
    if (safeData.teamId) this.teamId = safeData.teamId;
    else if (safeData.userId) this.userId = safeData.userId;
    if (safeData.external) this.external = safeData.external;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    if (this.iE(this.color)) e.push('color');
    return e;
  }

  /**
   * Check whether the chosen user can edit the appointments of this calendar.
   */
  public canUserManageAppointments(userId: string): boolean {
    // if the calendar is linked to external services, the user must have writing access
    if (this.external && this.external.userAccess > ExternalCalendarPermissions.READER) return false;
    // in case of shared calendar, the user must be in the list of the allowed ones
    else if (this.teamId && !this.usersCanManageAppointments.some(x => x === userId)) return false;
    // if no other condition denies it, the user is allowed
    else return true;
  }
}

/**
 * Additional info for the calendar, in case it's linked to an external service.
 */
export class ExternalCalendarInfo extends Resource {
  /**
   * The external service from which the calendar comes.
   */
  public service: ExternalCalendarSources;
  /**
   * Id of the external calendar.
   */
  public calendarId: string;
  /**
   * Name of the calendar in the external service.
   */
  public name: string;
  /**
   * The time of last synchronisation of the external calendar.
   */
  public lastSyncAt: epochDateTime;
  /**
   * An optional syncBookmark if the external service supports incremental synchronisation.
   */
  public syncBookmark: string;
  /**
   * An optional pageBookmark if the external service supports incremental synchronisation.
   * In case of synchronisation with multiple pages (Google); Microsoft manages this directly through the syncBookmark.
   */
  public pageBookmark: string;
  /**
   * The access level to the calendar for the user who linked the external service.
   */
  public userAccess: ExternalCalendarPermissions;

  public load(x: any) {
    super.load(x);
    this.service = this.clean(x.service, String);
    this.calendarId = this.clean(x.calendarId, String);
    this.name = this.clean(x.name, String);
    this.lastSyncAt = this.clean(x.lastSyncAt, d => new Date(d).getTime());
    this.syncBookmark = this.clean(x.syncBookmark, String);
    this.pageBookmark = this.clean(x.pageBookmark, String);
    this.userAccess = this.clean(x.userAccess, Number);
  }
}

/**
 * Possible permissions for an external calendar.
 */
export enum ExternalCalendarPermissions {
  FREE_BUSY,
  READER,
  WRITER,
  OWNER
}

/**
 * Additional info on a external calendar, detached from the main object for security reasons.
 *
 * Table: `idea_externalCalendarsTokens`.
 */
export class ExternalCalendarToken extends Resource {
  /**
   * The id external service calendar.
   */
  public calendarId: string;
  /**
   * The token to perform API requests to the external service.
   */
  public token: string;

  public load(x: any) {
    super.load(x);
    this.calendarId = this.clean(x.calendarId, String);
    this.token = this.clean(x.token, String);
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.calendarId = safeData.calendarId;
    this.token = safeData.token;
  }
}

/**
 * Possible services as source for external calendars.
 */
export enum ExternalCalendarSources {
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT'
}
