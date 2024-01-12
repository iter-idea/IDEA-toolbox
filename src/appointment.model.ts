import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * Represents an appointment (event) of a calendar.
 *
 * Table: `idea_appointments`.
 *
 * Indexes:
 *  - calendarId-startTime-index (LSI, all)
 *  - calendarId-masterAppointmentId-index (LSI, keys); to manage occurences
 *  - internalNotificationFiresOn-internalNotificationFiresAt-index (GSI); includes:
 *        internalNotificationProject, internalNotificationTeamId, internalNotificationUserId,
 *        notifications, title, startTime, endTime
 */
export class Appointment extends Resource {
  /**
   * The id of the appointment.
   * In case of external calendar, it's the external id; otherwise (local calendars), it's a IUID.
   */
  appointmentId: string;
  /**
   * The id of the calendar owning the appointment.
   * For external calendars, it's the direct id of the external calendar (and not the id of `idea_calendars`),
   * to avoid repetitions of appointments for each copy of the external calendar linked to an IDEA calendar.
   */
  calendarId: string;
  /**
   * A unique id for the appointment, shared across different calendars and calendaring systems (standard RFC5545);
   * i.e. each appointment in different calendars may have different `appointmentId`, but it always have same `iCalUID`.
   * Note: in many calendaring systems recurring events share the same `iCalUID`.
   */
  iCalUID: string;
  /**
   * Master appointment id (optional): the id of the master appointment, in case this is an occurence.
   */
  masterAppointmentId?: string;
  /**
   * The title of the appointment.
   */
  title: string;
  /**
   * The location of the appointment.
   */
  location: string;
  /**
   * The description of the appointment.
   */
  description: string;
  /**
   * The starting time of the appointment.
   */
  startTime: epochDateTime;
  /**
   * The ending time of the appointment.
   */
  endTime: epochDateTime;
  /**
   * If true, it's an all-day event.
   */
  allDay: boolean;
  /**
   * The timezone for the appointent start and end.
   */
  timezone: string;
  /**
   * In case the calendar is linked to external services, the link to access the external resource.
   */
  linkToOrigin?: string;
  /**
   * A list of objects linked to the appointment.
   */
  linkedTo?: AppointmentLinkedObject[];
  /**
   * The attendees supposed to partecipate to the event.
   * It's an empty array in case the appointment is "private", i.e. the creator is the only attendee.
   */
  attendees: AppointmentAttendee[];
  /**
   * The appointment notifications and the specs for their execution.
   * These may come from external calendars: in that case no internal notifications will fire.
   * Note on notifications from external services.
   *     - Microsoft: up to 1 notification, max 1 week before;
   *     - Google: up to 5 notifications; max 4 weeks before;
   *     - Multiple notifications at the same time are not allowed.
   */
  notifications: AppointmentNotification[];
  /**
   * Date and hour in which the reminder is slotted (`YYYYMMDDHH`). Avoid timezones: UTC!!
   * Used to quickly identify the reminders to manage in a particular time frame.
   * In case of appointments on external calendars these will not be valued.
   */
  internalNotificationFiresOn?: string;
  /**
   * Fine grain time of alert, expressed in minutes.
   * In case of appointments on external calendars these will not be valued.
   */
  internalNotificationFiresAt?: number;
  /**
   * Project from which the notification comes; useful to get the notification preferences.
   * In case of appointments on external calendars these will not be valued.
   */
  internalNotificationProject?: string;
  /**
   * Team of the user that need to be notified; useful to get the notification preferences.
   * In case of appointments on external calendars these will not be valued.
   */
  internalNotificationTeamId?: string;
  /**
   * User that need to be notified; useful to get the notification preferences.
   * In case of appointments on external calendars these will not be valued.
   */
  internalNotificationUserId?: string;

  load(x: any): void {
    super.load(x);
    this.appointmentId = this.clean(x.appointmentId, String);
    this.calendarId = this.clean(x.calendarId, String);
    this.iCalUID = this.clean(x.iCalUID, String);
    if (x.masterAppointmentId) this.masterAppointmentId = this.clean(x.masterAppointmentId, String);
    this.title = this.clean(x.title, String);
    this.location = this.clean(x.location, String);
    this.description = this.clean(x.description, String);
    this.startTime = this.clean(x.startTime, d => new Date(d).getTime());
    this.endTime = this.clean(x.endTime, d => new Date(d).getTime());
    this.allDay = this.clean(x.allDay, Boolean);
    this.fixAllDayTime();
    this.timezone = this.clean(x.timezone, String, Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (x.linkToOrigin) this.linkToOrigin = this.clean(x.linkToOrigin, String);
    this.notifications = this.cleanArray(x.notifications, n => new AppointmentNotification(n));
    if (!this.linkToOrigin && this.notifications.length) {
      // appointment comes from an internal calendar, notifications will fire
      this.internalNotificationProject = this.clean(x.internalNotificationProject, String);
      this.internalNotificationTeamId = this.clean(x.internalNotificationTeamId, String);
      this.internalNotificationUserId = this.clean(x.internalNotificationUserId, String);
      this.removeDuplicateNotifications();
      this.calculateFiringTime();
    }
    if (x.linkedTo) this.linkedTo = this.cleanArray(x.linkedTo, o => new AppointmentLinkedObject(o));
    this.attendees = this.cleanArray(x.attendees, a => new AppointmentAttendee(a));
  }
  /**
   * Set a default start/end day for all-day events, to be compatible with external services.
   */
  fixAllDayTime(): void {
    if (this.allDay) {
      const start = new Date(this.startTime);
      start.setHours(0, 0, 0);
      this.startTime = start.getTime();
      const end = new Date(this.endTime);
      end.setHours(13, 0, 0);
      this.endTime = end.getTime();
    }
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    this.appointmentId = safeData.appointmentId;
    this.calendarId = safeData.calendarId;
    this.iCalUID = safeData.iCalUID;
    if (safeData.masterAppointmentId) this.masterAppointmentId = safeData.masterAppointmentId;
    if (safeData.linkedTo) this.linkedTo = safeData.linkedTo;
    if (!this.linkToOrigin)
      if (this.notifications.length) {
        this.internalNotificationProject = safeData.internalNotificationProject;
        this.internalNotificationTeamId = safeData.internalNotificationTeamId;
        this.internalNotificationUserId = safeData.internalNotificationUserId;
        this.removeDuplicateNotifications();
        this.calculateFiringTime();
      } else {
        delete this.internalNotificationProject;
        delete this.internalNotificationTeamId;
        delete this.internalNotificationUserId;
        delete this.internalNotificationFiresAt;
        delete this.internalNotificationFiresOn;
      }
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.title)) e.push('title');
    if (this.iE(this.startTime)) e.push('startTime');
    if (this.iE(this.endTime)) e.push('endTime');
    if (this.iE(this.timezone)) e.push('timezone');
    return e;
  }

  /**
   * Helper to remove duplicates notifications for the same appointment.
   */
  protected removeDuplicateNotifications(): void {
    this.notifications = this.notifications.filter(
      (n, index, self) => index === self.findIndex(t => t.method === n.method && t.minutes === n.minutes)
    );
  }
  /**
   * Calculate the firing time for internal appointments.
   */
  calculateFiringTime(): void {
    // find the first notification to fire (max number of minutes to substract from the start time)
    const maxNumMinutes = Math.max.apply(
      null,
      this.notifications.map(n => n.minutes)
    );
    // prepare the support firing attributes
    const at = new Date(this.startTime);
    at.setMinutes(at.getMinutes() - maxNumMinutes);
    this.internalNotificationFiresOn = String(at.getFullYear()).concat(
      ('00' + String(at.getMonth() + 1)).slice(-2),
      ('00' + String(at.getDate())).slice(-2),
      ('00' + String(at.getHours())).slice(-2)
    );
    this.internalNotificationFiresAt = at.getMinutes();
  }

  /**
   * Get the information on an attendee.
   * The latter can be identified by email or, by default, as the attendee marked as `self`.
   */
  getAttendee(email?: string): AppointmentAttendee {
    return this.attendees.find(a => (email ? a.email === email : a.self));
  }
  /**
   * Get the attendance of the desired attendee.
   * The latter can be identified by email or, by default, as the attendee marked as `self`.
   */
  getAttendance(email?: string): AppointmentAttendance {
    const attendee = this.getAttendee(email);
    return attendee ? attendee.attendance : undefined;
  }
  /**
   * Whether the user is the organizer of the event.
   * The user can be identified by email or, by default, as the attendee marked as `self`.
   */
  isOrganizer(email?: string): boolean {
    // if the array is empty, the event is owned by the current user (there aren't other attendees)
    if (!this.attendees.length) return true;
    // otherwise, check whether the user is the organizer
    const attendee = this.getAttendee(email);
    return attendee ? attendee.organizer : false;
  }
}

/**
 * A brief view of the appointment, composed by only its keys.
 */
export class AppointmentKeys extends Resource {
  /**
   * The id of the appointment.
   * In case of external calendar, it's the external id; otherwise (local calendars), it's a IUID.
   */
  appointmentId: string;
  /**
   * The id of the calendar owning the appointment.
   * For external calendars, it's the direct id of the external calendar (and not the id of `idea_calendars`),
   * to avoid repetitions of appointments for each copy of the external calendar linked to an IDEA calendar.
   */
  calendarId: string;
  /**
   * The id of the team, in case it's a shared calendar.
   */
  teamId?: string;

  load(x: any): void {
    super.load(x);
    this.appointmentId = this.clean(x.appointmentId, String);
    this.calendarId = this.clean(x.calendarId, String);
    if (x.teamId) this.teamId = this.clean(x.teamId, String);
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.appointmentId)) e.push('appointmentId');
    if (this.iE(this.calendarId)) e.push('calendarId');
    return e;
  }
}

/**
 * A generic structure to reference to a linked object.
 */
export class AppointmentLinkedObject extends Resource {
  /**
   * The type of the referenced object.
   */
  type: AppointmentLinkedObjectTypes;
  /**
   * The id of the referenced object.
   */
  id: string;

  load(x: any): void {
    super.load(x);
    this.type = this.clean(x.type, Number);
    this.id = this.clean(x.id, String);
  }

  validate(): string[] {
    const e = super.validate();
    if (!(this.type in AppointmentLinkedObjectTypes)) e.push('type');
    if (this.iE(this.id)) e.push('id');
    return e;
  }
}

/**
 * The linked object types.
 */
export enum AppointmentLinkedObjectTypes {
  SCARLETT_ACTIVITY = 100,
  ARTHUR_ACTIVITY = 200
}

/**
 * The info about the attendee to an appointment.
 */
export class AppointmentAttendee extends Resource {
  /**
   * The email to identify the attendee.
   */
  email: string;
  /**
   * Whether the user identified by the email is the organizer of the event.
   */
  organizer: boolean;
  /**
   * Whether this attendee record refers to the current user.
   */
  self: boolean;
  /**
   * The attendance status.
   */
  attendance: AppointmentAttendance;

  load(x: any): void {
    super.load(x);
    this.email = this.clean(x.email, String);
    this.organizer = this.clean(x.organizer, Boolean);
    this.self = this.clean(x.self, Boolean);
    this.attendance = this.clean(x.attendance, Number, AppointmentAttendance.NEEDS_ACTION) as AppointmentAttendance;
  }
}

/**
 * Possible attendance status for the appointment.
 */
export enum AppointmentAttendance {
  DECLINED = -1,
  NEEDS_ACTION = 0,
  TENTATIVE,
  ACCEPTED
}

/**
 * The info about the appointment notification.
 */
export class AppointmentNotification extends Resource {
  /**
   * The method of the notification.
   */
  method: AppointmentNotificationMethods;
  /**
   * The number of minutes before the event start time that the reminder occurs.
   */
  minutes: number;

  load(x: any): void {
    super.load(x);
    this.method = this.clean(x.method, String) as AppointmentNotificationMethods;
    this.minutes = this.clean(x.minutes, Number, 0);
  }
}

/**
 * Possible notification methods (currently supported for Google Calendars and internal calendars).
 */
export enum AppointmentNotificationMethods {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL'
}

/**
 * Possible notification units of time.
 */
export enum AppointmentNotificationUnitsOfTime {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
  WEEKS = 'WEEKS'
}
