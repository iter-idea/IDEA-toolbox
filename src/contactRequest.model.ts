import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import { ClientInfo } from './clientInfo.model';

/**
 * Contact request from the Contacts Us box of the website or from specific campaigns.
 *
 * Table: `idea_contactRequests`.
 *
 * Indexes:
 *    - `campaign-timestamp-index` (GSI); includes: name, wantsDemo.
 */
export class ContactRequest extends Resource {
  /**
   * Business email to get in contact with the requester (PK).
   */
  public email: string;
  /**
   * Timestamp of the request (SK).
   */
  public timestamp: epochDateTime;
  /**
   * Full name of the requester.
   */
  public name?: string;
  /**
   * If any, specific campaign id.
   */
  public campaign?: string;
  /**
   * If set, the requester would like to be contacted for a demo.
   */
  public wantsDemo?: boolean;
  /**
   * The details of the client at the time of the error.
   */
  public client?: ClientInfo;

  public load(x: any) {
    super.load(x);
    this.email = this.clean(x.email, String);
    this.timestamp = this.clean(x.timestamp, d => new Date(d).getTime(), Date.now()) as epochDateTime;
    if (x.name) this.name = this.clean(x.name, String);
    if (x.campaign) this.campaign = this.clean(x.campaign, String);
    if (x.wantsDemo) this.wantsDemo = true;
    if (x.client) this.client = new ClientInfo(x.client);
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.email, 'email')) e.push('email');
    return e;
  }
}
