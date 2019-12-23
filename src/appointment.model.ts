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
   * An object linked to the appointment.
   */
  public linkedTo?: AppointmentLinkedObject;

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
    this.correctAllDay();
    this.timezone = this.clean(x.timezone, String);
    if (x.linkedTo) this.linkedTo = new AppointmentLinkedObject(x.linkedTo);
  }
  /**
   * Be sure the duration is at least 24 hours.
   */
  public correctAllDay() {
    if (this.allDay) {
      Moment(this.startTime).startOf('day');
      Moment(this.endTime).endOf('day');
    }
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.appointmentId = safeData.appointmentId;
    if (safeData.masterAppointmentId) this.masterAppointmentId = safeData.masterAppointmentId;
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
 * A generic structure to reference to a linked object.
 */
export class AppointmentLinkedObject extends Resource {
  /**
   * The id of the referenced object.
   */
  public id: string;
  /**
   * The name of the referenced object.
   */
  public name: string;

  public load(x: any) {
    super.load(x);
    this.id = this.clean(x.id, String);
    this.name = this.clean(x.name, String);
  }
}
