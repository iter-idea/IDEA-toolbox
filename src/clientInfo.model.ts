import { Resource } from './resource.model';

export class ClientInfo extends Resource {
  /**
   * Current timestamp from the client.
   */
  public timestamp: Date;
  /**
   * The timezone of the client.
   */
  public timezone: number;
  /**
   * In which page the client was on.
   */
  public pageOn: string;
  /**
   * The page referrer of the client.
   */
  public referrer: string;
  /**
   * The browser name.
   */
  public browserName: string;
  /**
   * The browser engine.
   */
  public browserEngine: string;
  /**
   * The browser version.
   */
  public browserVersion: string;
  /**
   * The browser user agent.
   */
  public browserUserAgent: string;
  /**
   * The browser language.
   */
  public browserLanguage: string;
  /**
   * The connection status of the browser.
   */
  public browserOnline: boolean;
  /**
   * The platform of the browser.
   */
  public browserPlatform: string;
  /**
   * The screen width.
   */
  public screenWidth: number;
  /**
   * The screen height.
   */
  public screenHeight: number;
  /**
   * The screen color depth.
   */
  public screenColorDepth: number;
  /**
   * The screen pixl depth.
   */
  public screenPixelDepth: number;

  public load(x: any) {
    super.load(x);
    this.timestamp = this.clean(x.timestamp, a => new Date(a).getTime(), Date.now());
    this.timezone = this.clean(x.timezone, Number);
    this.pageOn = this.clean(x.pageOn, String);
    this.referrer = this.clean(x.referrer, String);
    this.browserName = this.clean(x.browserName, String);
    this.browserEngine = this.clean(x.browserEngine, String);
    this.browserVersion = this.clean(x.browserVersion, String);
    this.browserUserAgent = this.clean(x.browserUserAgent, String);
    this.browserLanguage = this.clean(x.browserLanguage, String);
    this.browserOnline = this.clean(x.browserOnline, Boolean);
    this.browserPlatform = this.clean(x.browserPlatform, String);
    this.screenWidth = this.clean(x.screenWidth, Number);
    this.screenHeight = this.clean(x.screenHeight, Number);
    this.screenColorDepth = this.clean(x.screenColorDepth, Number);
    this.screenPixelDepth = this.clean(x.screenPixelDepth, Number);
  }
}
