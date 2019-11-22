import { Resource } from './resource.model';
import { ProjectSubscription } from './projectSubscription.model';
import { epochDateTime } from './epoch';

/**
 * Table: `idea_users`.
 */
export class User extends Resource {
  /**
   * Cognito sub.
   */
  public userId: string;
  /**
   * === username (from Cognito, **not in DynamoDB**).
   */
  public email: string;
  /**
   * The currently selected team.
   */
  public currentTeamId: string;
  /**
   * Timestamp of creation.
   */
  public createdAt: epochDateTime;
  /**
   * Timestamp of when the user's subscription limits have been calculated.
   */
  public lastLimitsCheckAt: epochDateTime;
  /**
   * Current subscription to a Horace's plan (_calculated field_).
   */
  public subscription?: ProjectSubscription;

  public load(x: any) {
    super.load(x);
    this.userId = this.clean(x.userId, String);
    this.email = this.clean(x.email, String);
    this.currentTeamId = this.clean(x.currentTeamId, String);
    this.createdAt = this.clean(x.createdAt, d => new Date(d).getTime(), Date.now());
    this.lastLimitsCheckAt = this.clean(x.lastLimitsCheckAt, Number, 0);
    if (x.subscription) this.subscription = new ProjectSubscription(x.subscription);
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    delete this.email; // stored only in Cognito
    this.userId = safeData.userId;
    this.currentTeamId = safeData.currentTeamId;
    this.createdAt = safeData.createdAt;
    this.lastLimitsCheckAt = safeData.lastLimitsCheckAt;
    delete this.subscription;
  }
}
