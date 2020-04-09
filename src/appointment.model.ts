import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import Moment = require('moment-timezone');

/**
 * Represents an appointment (event) in a calendar.
 * @todo in the future: alerts, status, guests, etc.
 *
 * Table: `idea_appointments`.
 *
 * Indexes:
 *  - calendarId-startTime-index (all)
 *  - calendarId-masterAppointmentId-index (include: appointmentId): to manage occurences
 */
export class Appointment extends Resource {
  /**
   * The id (IUID/external ID) of the appointment.
   */
  public appointmentId: string;
  /**
   * The id of the calendar currently containing the appointment (it could change).
   */
  public calendarId: string;
  /**
   * Master appointment id (optional): the id of the master appointment, in case this is an occurence.
   */
  public masterAppointmentId?: string;
  /**
   * The title of the appointment. Max 100 characters.
   */
  public title: string;
  /**
   * The location of the appointment. Max 150 characters.
   */
  public location: string;
  /**
   * The description of the appointment. Max 300 characters.
   */
  public description: string;
  /**
   * The starting time of the appointment.
   */
  public startTime: epochDateTime;
  /**
   * The ending time of the appointment.
   */
  public endTime: epochDateTime;
  /**
   * If true, it's an all-day event.
   */
  public allDay: boolean;
  /**
   * The timezone for the appointent start and end.
   */
  public timezone: string;
  /**
   * In case the calendar is linked to external services, the link to access the external resource.
   */
  public linkToOrigin?: string;
  /**
   * A list of objects linked to the appointment.
   */
  public linkedTo?: Array<AppointmentLinkedObject>;

  public load(x: any) {
    super.load(x);
    this.appointmentId = this.clean(x.appointmentId, String);
    this.calendarId = this.clean(x.calendarId, String);
    if (x.masterAppointmentId) this.masterAppointmentId = this.clean(x.masterAppointmentId, String);
    this.title = this.clean(x.title, String);
    if (this.title) this.title = this.title.slice(0, 100);
    this.location = this.clean(x.location, String);
    if (this.location) this.location = this.location.slice(0, 150);
    this.description = this.clean(x.description, String);
    if (this.description) this.description = this.description.slice(0, 300);
    this.startTime = this.clean(x.startTime, d => new Date(d).getTime());
    this.endTime = this.clean(x.endTime, d => new Date(d).getTime());
    this.allDay = this.clean(x.allDay, Boolean);
    this.fixAllDayTime();
    this.timezone = this.clean(x.timezone || Moment.tz.guess(), String);
    if (x.linkToOrigin) this.linkToOrigin = this.clean(x.linkToOrigin, String);
    if (x.linkedTo) this.linkedTo = this.cleanArray(x.linkedTo, o => new AppointmentLinkedObject(o));
  }
  /**
   * Set a default start/end day for all-day events; mid-day avoid any kind of timezone problem.
   */
  public fixAllDayTime() {
    if (this.allDay) {
      this.startTime = Number(Moment(this.startTime).startOf('day').add(12, 'hours').format('x'));
      this.endTime = Number(Moment(this.endTime).startOf('day').add(13, 'hours').format('x'));
    }
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.appointmentId = safeData.appointmentId;
    this.calendarId = safeData.calendarId;
    if (safeData.masterAppointmentId) this.masterAppointmentId = safeData.masterAppointmentId;
    if (safeData.linkedTo) this.linkedTo = safeData.linkedTo;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.calendarId)) e.push('calendarId');
    if (this.iE(this.title)) e.push('title');
    if (this.iE(this.startTime)) e.push('startTime');
    if (this.iE(this.endTime)) e.push('endTime');
    if (this.iE(this.timezone)) e.push('timezone');
    return e;
  }
}

/**
 * A brief view of the appointment, composed by only its keys.
 */
export class AppointmentKeys extends Resource {
  /**
   * The id (IUID/external ID) of the appointment.
   */
  public appointmentId: string;
  /**
   * The id of the calendar currently containing the appointment (it could change).
   */
  public calendarId: string;

  public load(x: any) {
    super.load(x);
    this.appointmentId = this.clean(x.appointmentId, String);
    this.calendarId = this.clean(x.calendarId, String);
  }

  public validate(): Array<string> {
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
  public type: AppointmentLinkedObjectTypes;
  /**
   * The id of the referenced object.
   */
  public id: string;

  public load(x: any) {
    super.load(x);
    this.type = this.clean(x.type, Number);
    this.id = this.clean(x.id, String);
  }

  public validate(): Array<string> {
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
