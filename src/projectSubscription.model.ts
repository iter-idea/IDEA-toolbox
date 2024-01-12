import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import { ProjectPlatforms } from './projectPlan.model';
import { MembershipSummary } from './membership.model';

/**
 * Table: `idea_projects_subscriptions`.
 *
 * Indexes:
 *    - `project-validUntil-index` (LSI - all).
 *    - `project-planId-index` (LSI - all).
 *    - `project-storeReferenceId-index` (LSI - all).
 */
export class ProjectSubscription extends Resource {
  /**
   * Project / product key.
   */
  project: string;
  /**
   * The id of the subscription (the target of the subscription to a plan).
   * Each project has its own meaning of it (e.g. teamId, userId, etc.).
   * Note: it should be a unique id in the entire project; add prefixes accordingly.
   */
  subscriptionId: string;
  /**
   * The id of the project plan.
   */
  planId: string;
  /**
   * The timestamp until this subscription is active.
   */
  validUntil: epochDateTime;
  /**
   * If false, the subscription won't renew after its set expiration.
   */
  autoRenewing: boolean;
  /**
   * The platform from which the subscription has been completed.
   * It will be possible to manage the subscription only from the platform in which it was firstly created.
   */
  platform: ProjectPlatforms;
  /**
   * The id of the plan in the store.
   */
  storePlanId: string;
  /**
   * The store reference id for the subscription.
   * It's an ID coming from the stores, used to double check that a purchase is actually linked to the subscriptionId.
   * Stripe: `id`.
   * iOS: `original_transaction_id`.
   * Android: the first part of the `orderId`.
   */
  storeReferenceId: string;
  /**
   * The original receipt of the subscription, to later on check with the store if a subscription is still active.
   */
  storeReceipt: string;
  /**
   * The user who manages the subscription.
   */
  managedByUser: MembershipSummary;

  load(x: any): void {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.subscriptionId = this.clean(x.subscriptionId, String);
    this.planId = this.clean(x.planId, String);
    this.validUntil = this.clean(x.validUntil, a => new Date(a).getTime());
    this.autoRenewing = this.clean(x.autoRenewing, Boolean);
    this.platform = this.clean(x.platform, String);
    this.storePlanId = this.clean(x.storePlanId, String);
    this.storeReferenceId = this.clean(x.storeReferenceId, String);
    this.storeReceipt = this.clean(x.storeReceipt, String);
    this.managedByUser = new MembershipSummary(x.managedByUser);
  }
}
