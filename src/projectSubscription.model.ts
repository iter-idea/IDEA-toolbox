import { Resource } from './resource.model';
import { epochDateTime } from './epoch';
import { ProjectPlatforms } from './projectPlan.model';

/**
 * Table: `idea_projects_subscriptions`.
 *
 * Indexes:
 *    - `project-validUntil-index` (LSI - all).
 *    - `project-planId-index` (LSI - all).
 *    - `project-storeReferenceId-index` (LSI - all).
 */
export class ProjectSubscription extends Resource  {
  /**
   * Project / product key.
   */
  public project: string;
  /**
   * The id of the subscription (the target of the subscription to a plan).
   * Each project has its own meaning of it (e.g. teamId, userId, etc.).
   * Note: it should be a unique id in the entire project; add prefixes accordingly.
   */
  public subscriptionId: string;
  /**
   * The id of the project plan.
   */
  public planId: string;
  /**
   * The timestamp until this subscription is active.
   */
  public validUntil: epochDateTime;
  /**
   * The platform from which the subscription has been completed.
   * It will be possible to manage the subscription only from the platform in which it was firstly created.
   */
  public platform: ProjectPlatforms;
  /**
   * The store reference id for the subscription.
   * It's an ID coming from the stores, used to double check that a purchase is actually linked to the subscriptionId.
   * iOS: `original_transaction_id`.
   * Android: the first part of the `orderId`.
   */
  public storeReferenceId: string;

  constructor() {
    super();
    this.project = null;
    this.subscriptionId = null;
    this.planId = null;
    this.validUntil = null;
    this.platform = null;
    this.storeReferenceId = null;
  }

  public load(x: any) {
    super.load(x);
    this.project = x.project ? String(x.project) : null;
    this.subscriptionId = x.subscriptionId ? String(x.subscriptionId) : null;
    this.planId = x.planId ? String(x.planId) : null;
    this.validUntil = x.validUntil ? new Date(x.validUntil).getTime() : null;
    this.platform = x.platform ? <ProjectPlatforms>String(x.platform) : null;
    this.storeReferenceId = x.storeReferenceId ? String(x.storeReferenceId) : null;
  }

  public safeLoad(_: any, safeData: any) {
    this.load(safeData);
    this.project = safeData.project;
    this.subscriptionId = safeData.subscriptionId;
  }
}
