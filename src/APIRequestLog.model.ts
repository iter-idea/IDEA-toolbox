import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * The log of an API request, in IDEA's format.
 *
 * Table: `idea_logs`.
 *
 * Indexes:
 *    - `projectTeamId-timestamp-index` (all).
 */
export class APIRequestLog extends Resource {
  /**
   * The key to identify the log stream; it's the concatenation of the project key with the teamId.
   */
  public projectTeamId: string;
  /**
   * Timestamp in which the log was captured.
   */
  public timestamp: epochDateTime;
  /**
   * Id of the user linked to the log.
   */
  public userId: string;
  /**
   * The concatenation of the timestamp with the userId, to support scenarios of concurrency.
   */
  public sort: string;
  /**
   * TTL of the record (in seconds); it's usually a month after the insertion.
   */
  public expiresAt: number;
  /**
   * The resource involved in the log; e.g. `/orders` or `/orders/{orderId}/items`.
   */
  public resource: string;
  /**
   * The determinated path for the resource; e.g. `/orders` or `/orders/12345/items`.
   */
  public path: string;
  /**
   * The identifier of a specific element of the resource (`proxy`).
   */
  public resourceId: string;
  /**
   * Enum: HTTP method (POST, GET, etc.).
   */
  public method: string;
  /**
   * If true, the request ended successfully.
   */
  public requestSucceeded: boolean;
  /**
   * Action detail; valid (mostly) for PATCH requests.
   */
  public action?: string;
  /**
   * For complex logs, it contains extra information.
   */
  public description?: string;

  public load(x: any) {
    super.load(x);
    this.projectTeamId = this.clean(x.projectTeamId, String);
    this.timestamp = this.clean(x.timestamp, d => new Date(d).getTime(), Date.now());
    this.userId = this.clean(x.userId, String);
    this.sort = `${this.timestamp}_${this.userId}`;
    this.expiresAt = Math.round((this.timestamp + 2629800) / 1000); // +1 month, cast to seconds
    this.resource = this.clean(x.resource, String);
    this.path = this.clean(x.path, String);
    this.resourceId = this.clean(x.resourceId, String);
    this.method = this.clean(x.method, String);
    this.requestSucceeded = this.clean(x.requestSucceeded, Boolean);
    if (x.action) this.action = this.clean(x.action, String);
    if (x.description) this.description = this.clean(x.description, String);
  }
}
