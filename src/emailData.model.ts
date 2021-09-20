import { Resource } from './resource.model';

export class EmailData extends Resource {
  /**
   * The default email subject.
   */
  subject: string;
  /**
   * The default email content.
   */
  content: string;
  /**
   * Default addresses to who to send the email in TO.
   */
  to: string[];
  /**
   * Default addresses to who to send the email in CC.
   */
  cc: string[];
  /**
   * Default addresses to who to send the email in BCC.
   */
  bcc: string[];

  load(x: any) {
    super.load(x);
    this.subject = this.clean(x.subject, String);
    this.content = this.clean(x.content, String);
    this.to = x.to && typeof x.to === 'string' ? this.clean(x.to, String).split(',') : this.cleanArray(x.to, String);
    this.cc = x.cc && typeof x.cc === 'string' ? this.clean(x.cc, String).split(',') : this.cleanArray(x.cc, String);
    this.bcc =
      x.bcc && typeof x.bcc === 'string' ? this.clean(x.bcc, String).split(',') : this.cleanArray(x.bcc, String);
  }
}
