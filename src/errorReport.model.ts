import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

export class ClientError extends Resource {
  /**
   * The name of the error.
   */
  public name: string;
  /**
   * The error message.
   */
  public message: string;
  /**
   * The error stack (stringified).
   */
  public stack: string;

  constructor(x?: any) {
    super();
    this.name = null;
    this.message = null;
    this.stack = null;
    if (x) this.load(x);
  }

  public load(x: any) {
    super.load(x);
    this.name = this.clean(x.name, String);
    this.message = this.clean(x.message, String);
    this.stack = this.clean(x.stack, String);
  }
}

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

  constructor(x?: any) {
    super();
    this.timestamp = null;
    this.timezone = null;
    this.pageOn = null;
    this.referrer = null;
    this.browserName = null;
    this.browserEngine = null;
    this.browserVersion = null;
    this.browserUserAgent = null;
    this.browserLanguage = null;
    this.browserOnline = false;
    this.browserPlatform = null;
    this.screenWidth = null;
    this.screenHeight = null;
    this.screenColorDepth = null;
    this.screenPixelDepth = null;
    if (x) this.load(x);
  }

  public load(x: any) {
    this.timestamp = this.clean(x.timestamp, a => new Date(a), Date.now());
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

/**
 * Table: `idea_projects_errorsReports`.
 */
export class ErrorReport extends Resource {
  /**
   * Project / product key.
   */
  public project: string;
  /**
   * The timestamp of creation (server).
   */
  public createdAt: epochDateTime;
  /**
   * Expiration time, in seconds.
   */
  public expiresAt: number;
  /**
   * The details of the error.
   */
  public error: ClientError;
  /**
   * The details of the client at the time of the error.
   */
  public client: ClientInfo;

  constructor(x?: any) {
    super();
    this.project = null;
    this.createdAt = Date.now();
    this.expiresAt = Math.round(new Date(this.createdAt).getTime() / 1000);
    this.error = new ClientError();
    this.client = new ClientInfo();
    if (x) this.load(x);
  }

  public load(x: any) {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.createdAt = this.clean(x.createdAt, a => new Date(a), Date.now());
    this.expiresAt = Math.round(new Date(this.createdAt).getTime() / 1000);
    this.error = new ClientError(x.error);
    this.client = new ClientInfo(x.client);
  }

  public safeLoad(_: any, safeData: any) {
    this.load(safeData);
    this.project = safeData.project;
    this.createdAt = safeData.createdAt;
    this.expiresAt = safeData.expiresAt;
  }
}
