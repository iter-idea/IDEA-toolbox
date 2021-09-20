import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * The log of an API request, in IDEA's format.
 *
 * Table: `idea_logs`.
 *
 * Indexes:
 *    - `logId-timestamp-index` (all).
 */
export class APIRequestLog extends Resource {
  /**
   * The id to identify the log stream; usually, it's the concatenation of the project key with the teamId.
   */
  logId: string;
  /**
   * Timestamp in which the log was captured.
   */
  timestamp: epochDateTime;
  /**
   * Id of the user linked to the log.
   */
  userId: string;
  /**
   * The concatenation of the timestamp with the userId, to support scenarios of concurrency.
   */
  sort: string;
  /**
   * TTL of the record (in seconds); it's usually a month after the insertion.
   */
  expiresAt: number;
  /**
   * The resource involved in the log; e.g. `/orders` or `/orders/{orderId}/items`.
   */
  resource: string;
  /**
   * The determinated path for the resource; e.g. `/orders` or `/orders/12345/items`.
   */
  path: string;
  /**
   * The identifier of a specific element of the resource (`proxy`).
   */
  resourceId: string;
  /**
   * Enum: HTTP method (POST, GET, etc.).
   */
  method: string;
  /**
   * If true, the request ended successfully.
   */
  succeeded: boolean;
  /**
   * Action detail; valid (mostly) for PATCH requests.
   */
  action?: string;
  /**
   * For complex logs, it contains extra information.
   */
  description?: string;

  load(x: any) {
    super.load(x);
    this.logId = this.clean(x.logId, String);
    this.timestamp = this.clean(x.timestamp, d => new Date(d).getTime(), Date.now());
    this.userId = this.clean(x.userId, String);
    this.sort = `${this.timestamp}_${this.userId || null}`;
    this.expiresAt = Math.round(this.timestamp / 1000) + 2629800; // cast to seconds, +1 month
    this.resource = this.clean(x.resource, String);
    this.path = this.clean(x.path, String);
    this.resourceId = this.clean(x.resourceId, String);
    this.method = this.clean(x.method, String);
    this.succeeded = this.clean(x.succeeded, Boolean);
    if (x.action) this.action = this.clean(x.action, String);
    if (x.description) this.description = this.clean(x.description, String);
  }
}
