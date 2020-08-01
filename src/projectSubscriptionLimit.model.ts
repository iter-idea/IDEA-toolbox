import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * The current limits of a project subscription.
 * Note: this model should be updated only with direct updates (not with entire PUTs).
 *
 * Table: `idea_projectsSubscriptions_limits`.
 *
 * Indexes:
 *   - `projectSubscriptionId-renewsOn-index` LSI, all.
 */
export class ProjectSubscriptionLimit extends Resource {
  /**
   * The concatenation of a project and the id of a subscription.
   */
  public projectSubscriptionId: string;
  /**
   * The id of the limit.
   */
  public limitId: string;
  /**
   * The numeric representation of the limit.
   */
  public limit: number;
  /**
   * The counter towards the limit.
   */
  public counter: number;
  /**
   * The timestamp of when a renewable limit will be renewed (the counter will be reset).
   * If not set, the limit isn't renewable.
   */
  public renewsOn?: epochDateTime;

  public load(x: any) {
    super.load(x);
    this.projectSubscriptionId = this.clean(x.projectSubscriptionId, String);
    this.limitId = this.clean(x.limitId, String);
    this.limit = this.clean(x.limit, Number);
    this.counter = this.clean(x.counter, Number);
    if (x.renewsOn) this.renewsOn = this.clean(x.renewsOn, a => new Date(a).getTime());
  }

  /**
   * Add a number to the counter; default: 1.
   */
  public add(number?: number, forceLimit?: boolean) {
    if (forceLimit || this.canAdd()) this.counter += number || 1;
  }
  /**
   * Substract a number to the counter; default: 1.
   */
  public subtract(number?: number, forceLimit?: boolean) {
    if (forceLimit || this.canSubtract()) this.counter -= number || 1;
  }
  /**
   * Reset the counter.
   */
  public reset() {
    this.counter = 0;
  }

  /**
   * Whether the counter can increase.
   */
  public canAdd(): boolean {
    return this.counter < this.limit;
  }
  /**
   * Whether the counter can decrease.
   */
  public canSubtract(): boolean {
    return this.counter > 0;
  }
  /**
   * Whether the counter is closed to the limit, based on a percentage; default: 80.
   */
  public isCloseToLimit(maxPercentage?: number): boolean {
    maxPercentage = maxPercentage || 80;
    const percentage = (this.counter * 100) / this.limit;
    return percentage >= maxPercentage;
  }
  /**
   * Whether the limit has been reached by the counter.
   */
  public limitReached(): boolean {
    return this.counter >= this.limit;
  }
  /**
   * Whether the counter exceeds the limit or goes negative.
   */
  public exceeds(): boolean {
    return this.counter > this.limit || this.counter < 0;
  }
}
