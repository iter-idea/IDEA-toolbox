import { epochISOString } from './epoch';
import { Resource } from './resource.model';

export class ClientInfo extends Resource {
  /**
   * Current timestamp from the client.
   */
  timestamp: epochISOString;
  /**
   * Info about the client's platform.
   */
  platform: string;
  /**
   * The client's screen width.
   */
  screenWidth: number;
  /**
   * The client's screen height.
   */
  screenHeight: number;
  /**
   * Whether the client is in landscape mode; otherwise, portrait.
   */
  isLandscape: boolean;
  /**
   * The current url on the client.
   */
  url: string;
  /**
   * The page referrer of the client.
   */
  referrer: string;
  /**
   * Whether the client was online at the time of the error.
   */
  isOnline: boolean;
  /**
   * The client's language.
   */
  language: string;
  /**
   * The client's user agent.
   */
  userAgent: string;

  load(x: any) {
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
