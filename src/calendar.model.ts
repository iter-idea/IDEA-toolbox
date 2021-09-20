import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * Representation of a calendar, which can be:
 *  - private (linked to a user) or shared (linked to a team).
 *  - linked to an external service (Microsoft, Google, etc.) or not.
 *
 * Table: `idea_calendars`.
 *
 * Indexes:
 *  - userId-name-index (GSI, all)
 *  - teamId-name-index (GSI, all)
 */
export class Calendar extends Resource {
  /**
   * The id (IUID) of the calendar.
   */
  calendarId: string;
  /**
   * The id of the teamId owning the calendar, in case of team calendar (this cannot be changed).
   */
  teamId?: string;
  /**
   * The id of the user owning the calendar, in case of private calendar (this cannot be changed).
   * If `teamId` is set, this attribute is ignored.
   */
  userId?: string;
  /**
   * The name of the calendar. Max 100 characters.
   */
  name: string;
  /**
   * The description of the calendar. Max 300 characters.
   */
  description: string;
  /**
   * An identifying color for the calendar; e.g. `#0010AA`.
   */
  color: string;
  /**
   * A default timezone for the calendar.
   */
  timezone: string;
  /**
   * Extra info about the calendar, if linked to an external service.
   */
  external?: ExternalCalendarInfo;
  /**
   * In case of shared calendar, the IDs of the users that can manage the calendar's appointments.
   * If `null`, everyone can manage the calendar's appointments; if empty (`[]`), no one can (read-only).
   */
  usersCanManageAppointments?: string[];
  /**
   * In case of shared calendar, the id of the user who created it.
   */
  createdByUserId?: string;

  load(x: any) {
    super.load(x);
    this.calendarId = this.clean(x.calendarId, String);
    if (x.teamId) this.teamId = this.clean(x.teamId, String);
    else if (x.userId) this.userId = this.clean(x.userId, String);
    this.name = this.clean(x.name, String);
    if (this.name) this.name = this.name.slice(0, 100);
    this.description = this.clean(x.description, String);
    if (this.description) this.description = this.description.slice(0, 300);
    this.color = this.clean(x.color, String);
    this.timezone = this.clean(x.timezone, String, Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (x.external) this.external = new ExternalCalendarInfo(x.external);
    if (x.teamId && x.usersCanManageAppointments)
      this.usersCanManageAppointments = this.cleanArray(x.usersCanManageAppointments, String);
    if (x.teamId) this.createdByUserId = this.clean(x.createdByUserId, String);
  }

  safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.calendarId = safeData.calendarId;
    if (safeData.teamId) this.teamId = safeData.teamId;
    else if (safeData.userId) this.userId = safeData.userId;
    if (safeData.external) this.external = safeData.external;
    if (safeData.teamId && safeData.createdByUserId) this.createdByUserId = safeData.createdByUserId;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    return e;
  }

  /**
   * Check whether the chosen user can edit the appointments of this calendar.
   */
  canUserManageAppointments(userId: string): boolean {
    // if the calendar is linked to external services, the user must have writing access
    if (this.external && this.external.userAccess < ExternalCalendarPermissions.WRITER) return false;
    // in case of shared calendar, and the allowance list is set, the user must be in the list of the allowed ones
    else if (this.teamId && this.usersCanManageAppointments && !this.usersCanManageAppointments.some(x => x === userId))
      return false;
    // if no other condition denies it, the user is allowed
    else return true;
  }
  /**
   * Whether the calendar is shared (linked to a team) or not.
   */
  isShared(): boolean {
    return Boolean(this.teamId);
  }

  /**
   * The id to use to represent the calendar, based on the fact the calendar is linked to external sources or not.
   */
  getCalendarIdForAppointments(): string {
    return this.external ? this.external.service.concat('_', this.external.calendarId) : this.calendarId;
  }
}

/**
 * Additional info for the calendar, in case it's linked to an external service.
 */
export class ExternalCalendarInfo extends Resource {
  /**
   * The external service from which the calendar comes.
   */
  service: ExternalCalendarSources;
  /**
   * Id of the external calendar.
   */
  calendarId: string;
  /**
   * Name of the calendar in the external service.
   */
  name: string;
  /**
   * The time of last synchronisation of the external calendar.
   */
  lastSyncAt: epochDateTime;
  /**
   * An optional syncBookmark if the external service supports incremental synchronisation.
   */
  syncBookmark: string;
  /**
   * An optional pageBookmark if the external service supports incremental synchronisation.
   * In case of synchronisation with multiple pages (Google); Microsoft manages this directly through the syncBookmark.
   */
  pageBookmark: string;
  /**
   * The access level to the calendar for the user who linked the external service.
   */
  userAccess: ExternalCalendarPermissions;
  /**
   * Email address with which the user has registered to the service.
   */
  email: string;

  load(x: any) {
    super.load(x);
    this.service = this.clean(x.service, String);
    this.calendarId = this.clean(x.calendarId, String);
    this.name = this.clean(x.name, String);
    this.lastSyncAt = this.clean(x.lastSyncAt, d => new Date(d).getTime());
    this.syncBookmark = this.clean(x.syncBookmark, String);
    this.pageBookmark = this.clean(x.pageBookmark, String);
    this.userAccess = this.clean(x.userAccess, Number);
    this.email = this.clean(x.email, String);
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
  calendarId: string;
  /**
   * The token to perform API requests to the external service.
   */
  token: string;

  load(x: any) {
    super.load(x);
    this.calendarId = this.clean(x.calendarId, String);
    this.token = this.clean(x.token, String);
  }

  safeLoad(newData: any, safeData: any) {
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
