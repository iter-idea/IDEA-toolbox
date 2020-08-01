import { Resource } from './resource.model';

/**
 * A limit counter.
 */
export class LimitCounter extends Resource {
  /**
   * The counter.
   */
  public counter: number;
  /**
   * The limit against which the counter moves.
   */
  public limit: number;

  public load(x: any) {
    super.load(x);
    this.counter = this.clean(x.counter, Number);
    this.limit = this.clean(x.limit, Number);
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
