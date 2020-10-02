import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import { ClientInfo } from './clientInfo.model';
import { ClientError } from './clientError.model';

const EXPIRES_AT_DEFAULT_MARING_SEC = 5184000; // 60 days

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

  public load(x: any) {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.createdAt = this.clean(x.createdAt, a => new Date(a), Date.now());
    this.expiresAt = Math.round(new Date(this.createdAt).getTime() / 1000 + EXPIRES_AT_DEFAULT_MARING_SEC);
    this.error = new ClientError(x.error);
    this.client = new ClientInfo(x.client);
  }

  public safeLoad(newData: any, safeData: any) {
    this.safeLoad(newData, safeData);
    this.project = safeData.project;
    this.createdAt = safeData.createdAt;
    this.expiresAt = Math.round(safeData.createdAt / 1000 + EXPIRES_AT_DEFAULT_MARING_SEC);
  }
}
