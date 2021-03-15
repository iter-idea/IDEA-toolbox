import { Resource } from './resource.model';
import { ClientInfo } from './clientInfo.model';
import { epochISOString } from './epoch';

/**
 * Table: `idea_projects_errorsReports`.
 */
export class ErrorReport extends Resource {
  /**
   * Project/product key.
   */
  public project: string;
  /**
   * The version of the project/product.
   */
  public version: string;
  /**
   * The stage currently set (dev/prod/etc.).
   */
  public stage: string;
  /**
   * The timestamp of creation (backend).
   */
  public createdAt: epochISOString;
  /**
   * Timestamp of when the report should expire, expressed in seconds.
   */
  public expiresAt: number;
  /**
   * The type of the error.
   */
  public type: string;
  /**
   * The error message.
   */
  public error: string;
  /**
   * The error stack (stringified).
   */
  public stack: string;
  /**
   * The details of the client at the time of the error.
   */
  public client: ClientInfo;

  public load(x: any) {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.version = this.clean(x.version, String);
    this.stage = this.clean(x.stage, String);
    this.createdAt = this.clean(x.createdAt, t => new Date(t).toISOString()) as epochISOString;
    this.expiresAt = this.clean(x.expiresAt, Number);
    this.type = this.clean(x.type, String);
    this.error = this.clean(x.error, String);
    this.stack = this.clean(x.stack, String);
    this.client = new ClientInfo(x.client);
  }
}
