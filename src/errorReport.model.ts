import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

export class IDEAClientError {
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
    x = x || <IDEAClientError> {};
    this.name = x.name ? String(x.name) : null;
    this.message = x.message ? String(x.message) : null;
    this.stack = x.stack ? String(x.stack) : null;
  }
}

export class IDEAClientInfo {
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
    x = x || <IDEAClientInfo> {};
    this.timestamp = x.timestamp ? new Date(x.timestamp) : null;
    this.timezone = x.timezone ? Number(x.timezone) : null;
    this.pageOn = x.pageOn ? String(x.pageOn) : null;
    this.referrer = x.referrer ? String(x.referrer) : null;
    this.browserName = x.browserName ? String(x.browserName) : null;
    this.browserEngine = x.browserEngine ? String(x.browserEngine) : null;
    this.browserVersion = x.browserVersion ? String(x.browserVersion) : null;
    this.browserUserAgent = x.browserUserAgent ? String(x.browserUserAgent) : null;
    this.browserLanguage = x.browserLanguage ? String(x.browserLanguage) : null;
    this.browserOnline = Boolean(x.browserOnline);
    this.browserPlatform = x.browserPlatform ? String(x.browserPlatform) : null;
    this.screenWidth = x.screenWidth ? Number(x.screenWidth) : null;
    this.screenHeight = x.screenHeight ? Number(x.screenHeight) : null;
    this.screenColorDepth = x.screenColorDepth ? Number(x.screenColorDepth) : null;
    this.screenPixelDepth = x.screenPixelDepth ? Number(x.screenPixelDepth) : null;
  }
}

/**
 * Table: `idea_projects_errorsReports`.
 */
export class IDEAErrorReport extends Resource  {
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
  public error: IDEAClientError;
  /**
   * The details of the client at the time of the error.
   */
  public client: IDEAClientInfo;

  constructor() {
    super();
    this.project = null;
    this.createdAt = Date.now();
    this.expiresAt = Math.round(new Date(this.createdAt).getTime() / 1000);
    this.error = new IDEAClientError();
    this.client = new IDEAClientInfo();
  }

  public load(x: any) {
    super.load(x);
    this.project = x.project ? String(x.project) : null;
    this.createdAt = x.createdAt ? new Date(x.createdAt).getTime() : this.createdAt;
    this.expiresAt = Math.round(new Date(this.createdAt).getTime() / 1000);
    this.error = new IDEAClientError(x.error);
    this.client = new IDEAClientInfo(x.client);
  }

  public safeLoad(_: any, safeData: any) {
    this.load(safeData);
    this.project = safeData.project;
    this.createdAt = safeData.createdAt;
    this.expiresAt = safeData.expiresAt;
  }
}
