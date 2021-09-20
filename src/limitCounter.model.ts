import { Resource } from './resource.model';

/**
 * A limit counter.
 */
export class LimitCounter extends Resource {
  /**
   * The counter.
   */
  counter: number;
  /**
   * The limit against which the counter moves.
   */
  limit: number;

  load(x: any) {
    super.load(x);
    this.counter = this.clean(x.counter, Number, 0);
    this.limit = this.clean(x.limit, Number, 0);
  }

  /**
   * Add a number to the counter; default: 1.
   */
  add(number?: number, forceLimit?: boolean) {
    if (forceLimit || this.canAdd()) this.counter += number || 1;
  }
  /**
   * Substract a number to the counter; default: 1.
   */
  subtract(number?: number, forceLimit?: boolean) {
    if (forceLimit || this.canSubtract()) this.counter -= number || 1;
  }
  /**
   * Reset the counter.
   */
  reset() {
    this.counter = 0;
  }

  /**
   * Whether the counter can increase.
   */
  canAdd(): boolean {
    return this.counter < this.limit;
  }
  /**
   * Whether the counter can decrease.
   */
  canSubtract(): boolean {
    return this.counter > 0;
  }
  /**
   * Whether the counter is closed to the limit, based on a percentage; default: 80.
   */
  isCloseToLimit(maxPercentage?: number): boolean {
    maxPercentage = maxPercentage || 80;
    const percentage = (this.counter * 100) / this.limit;
    return percentage >= maxPercentage;
  }
  /**
   * Whether the limit has been reached by the counter.
   */
  limitReached(): boolean {
    return this.counter >= this.limit;
  }
  /**
   * Whether the counter exceeds the limit or goes negative.
   */
  exceeds(): boolean {
    return this.counter > this.limit || this.counter < 0;
  }
}
