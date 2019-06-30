import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * Table: `idea_projects_subscriptions`.
 *
 * Indexes:
 *    - `project-activeUntil-index` (LSI); includes: type.
 *
 * Note: this class should be inherited in each different project, adding a meaning to the subscription.
 */
export class ProjectSubscription extends Resource  {
  /**
   * Project / product key.
   */
  public project: string;
  /**
   * The id of the subscription; it gets meaning when this class is inherited in a project.
   */
  public subscriptionId: string;
  /**
   * The timestamp until this subscription is active.
   */
  public validUntil?: epochDateTime;
  /**
   * The type of subscription; it gets meaning when this class is inherited in a project.
   */
  public type: ProjectSubscriptionType;

  constructor() {
    super();
    this.project = null;
    this.subscriptionId = null;
    this.validUntil = null;
    this.type = null;
  }

  public load(x: any) {
    super.load(x);
    this.project = x.project ? String(x.project) : null;
    this.subscriptionId = x.subscriptionId ? String(x.subscriptionId) : null;
    this.validUntil = x.validUntil ? new Date(x.validUntil).getTime() : null;
    this.type = x.type ? <ProjectSubscriptionType> String(x.type) : null;
  }

  public safeLoad(_: any, safeData: any) {
    this.load(safeData);
    this.project = safeData.project;
    this.subscriptionId = safeData.subscriptionId;
  }
}

/**
 * The subscription's types; it gets meaning when this enum is redifined in a project.
 */
export enum ProjectSubscriptionType { NONE = '' }
