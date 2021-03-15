import { epochISOString } from './epoch';
import { Resource } from './resource.model';

export class ClientInfo extends Resource {
  /**
   * Current timestamp from the client.
   */
  public timestamp: epochISOString;
  /**
   * Info about the client's platform.
   */
  public platform: string;
  /**
   * The client's screen width.
   */
  public screenWidth: number;
  /**
   * The client's screen height.
   */
  public screenHeight: number;
  /**
   * Whether the client is in landscape mode; otherwise, portrait.
   */
  public isLandscape: boolean;
  /**
   * The current url on the client.
   */
  public url: string;
  /**
   * The page referrer of the client.
   */
  public referrer: string;
  /**
   * Whether the client was online at the time of the error.
   */
  public isOnline: boolean;
  /**
   * The client's language.
   */
  public language: string;
  /**
   * The client's user agent.
   */
  public userAgent: string;

  public load(x: any) {
    super.load(x);
    this.timestamp = this.clean(x.timestamp, t => new Date(t).toISOString()) as epochISOString;
    this.platform = this.clean(x.platform, String);
    this.screenWidth = this.clean(x.screenWidth, Number);
    this.screenHeight = this.clean(x.screenHeight, Number);
    this.isLandscape = this.clean(x.isLandscape, Boolean);
    this.url = this.clean(x.url, String);
    this.referrer = this.clean(x.referrer, String);
    this.isOnline = this.clean(x.isOnline, Boolean);
    this.language = this.clean(x.language, String);
    this.userAgent = this.clean(x.userAgent, String);
  }
}
