import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import { SubscriptionPlatforms } from './projectSubscription.model';

/**
 * Table: `idea_projects_subscriptionsEntries`.
 *
 * Indexes:
 *    - `project-validUntil-index` (LSI): includes: subscriptionId.
 *    - `project-subscriptionId-index` (LSI - all).
 */
export class ProjectSubscriptionEntry extends Resource  {
  /**
   * Project / product key.
   */
  public project: string;
  /**
   * The id of the entry (the target of the subscription).
   * Each project has its own meaning of it (e.g. teamId, userId, etc.).
   * Note: it should be a unique id in the entire project; add prefixes accordingly.
   */
  public entryId: string;
  /**
   * The id of the project subscription.
   */
  public subscriptionId: string;
  /**
   * The timestamp until this subscription is active.
   */
  public validUntil: epochDateTime;
  /**
   * The platform from which the subscription has been completed.
   * It will be possible to manage the subscription only from the platform in which it was firstly created.
   */
  public platform: SubscriptionPlatforms;
  /**
   * The store reference id for the entry.
   * It's an ID coming from the stores, used to double check that a purchase is actually linked to the entryId.
   * iOS: `original_transaction_id`.
   * Android: the first part of the `orderId`.
   */
  public storeReferenceId: string;

  constructor() {
    super();
    this.project = null;
    this.entryId = null;
    this.subscriptionId = null;
    this.validUntil = null;
    this.platform = null;
    this.storeReferenceId = null;
  }

  public load(x: any) {
    super.load(x);
    this.project = x.project ? String(x.project) : null;
    this.entryId = x.entryId ? String(x.entryId) : null;
    this.subscriptionId = x.subscriptionId ? String(x.subscriptionId) : null;
    this.validUntil = x.validUntil ? new Date(x.validUntil).getTime() : null;
    this.platform = x.platform ? <SubscriptionPlatforms>String(x.platform) : null;
    this.storeReferenceId = x.storeReferenceId ? String(x.storeReferenceId) : null;
  }

  public safeLoad(_: any, safeData: any) {
    this.load(safeData);
    this.project = safeData.project;
    this.entryId = safeData.entryId;
  }
}
