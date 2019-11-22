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
 *  - userId-name-index (all)
 *  - teamId-name-index (all)
 */
export class Calendar extends Resource {
  /**
   * The id (IUID) of the calendar.
   */
  public calendarId: string;
  /**
   * The id of the teamId owning the calendar, in case of shared calendar (this cannot be changed).
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
   * An identifying color for the calendar (HEX). E.g. `0010AA`.
   */
  public color: string;
  /**
   * Extra info about the calendar, if linked to an external service.
   */
  public external?: ExternalCalendarInfo;

  public load(x: any) {
    super.load(x);
    this.calendarId = this.clean(x.calendarId, String);
    if (x.teamId) this.teamId = this.clean(x.teamId, String);
    else if (x.userId) this.userId = this.clean(x.userId, String);
    this.name = this.clean(x.name, String).slice(0, 100);
    this.description = this.clean(x.description, String).slice(0, 300);
    this.color = this.clean(x.color, String);
    if (x.external) this.external = new ExternalCalendarInfo(x.external);
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
    if (this.external) this.external.validate().forEach(ea => e.push(`external.${ea}`));
    return e;
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
   * Id / reference of the user in the external service.
   */
  public userContext: string;
  /**
   * Name / email of the user in the external service.
   */
  public userName: string;
  /**
   * The time of last synchronisation of the external calendar.
   */
  public lastSyncAt: epochDateTime;
  /**
   * An optional syncBookmark if the external service supports incremental synchronisation.
   */
  public syncBookmark: string;

  public load(x: any) {
    super.load(x);
    this.service = this.clean(x.service, String);
    this.calendarId = this.clean(x.calendarId, String);
    this.userContext = this.clean(x.userContext, String);
    this.userName = this.clean(x.userName, String);
    this.lastSyncAt = this.clean(x.lastSyncAt, d => new Date(d).getTime());
    this.syncBookmark = this.clean(x.syncBookmark, String);
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (!(this.service in ExternalCalendarSources)) e.push('service');
    if (this.iE(this.calendarId)) e.push('calendarId');
    if (this.iE(this.userContext)) e.push('userContext');
    if (this.iE(this.userName)) e.push('userName');
    return e;
  }
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
