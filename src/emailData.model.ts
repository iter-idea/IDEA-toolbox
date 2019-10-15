import { Resource } from './resource.model';

export class EmailData extends Resource {
  /**
   * The default email subject.
   */
  public subject: string;
  /**
   * The default email content.
   */
  public content: string;
  /**
   * Default addresses to who to send the email in TO.
   */
  public to?: Array<string>;
  /**
   * Default addresses to who to send the email in CC.
   */
  public cc?: Array<string>;
  /**
   * Default addresses to who to send the email in BCC.
   */
  public bcc?: Array<string>;

  public load(x: any) {
    super.load(x);
    this.subject = this.clean(x.subject, String);
    this.content = this.clean(x.content, String);
    this.to = typeof x.to === 'string' ? this.clean(x.to, String).split(',') : this.cleanArray(x.to, String);
    this.cc = typeof x.cc === 'string' ? this.clean(x.cc, String).split(',') : this.cleanArray(x.cc, String);
    this.bcc = typeof x.bcc === 'string' ? this.clean(x.bcc, String).split(',') : this.cleanArray(x.bcc, String);
  }
}
