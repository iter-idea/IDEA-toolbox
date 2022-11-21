import { Resource } from './resource.model';

/**
 * An interval between two moments of the same day.
 * Note well: the timestamps should be stored and displayed considering UTC time (i.e. without any timezone).
 */
export class TimeInterval extends Resource {
  /**
   * The moment in the day (UTC), when the interval starts; in ms.
   */
  from: number;
  /**
   * The moment in the day (UTC), when the interval ends; in ms.
   */
  to: number;

  load(x: any): void {
    super.load(x);
    this.from = this.clean(x.from, Number, 0);
    this.to = this.clean(x.to, Number, 0);
    // if "from" is set, the default value for "to" is the next midnight
    if (this.from && this.to === 0) this.to = 86400000;
  }

  validate(): string[] {
    const e = super.validate();
    // the starting time can't be lower than 0
    if (this.from < 0) e.push('from');
    // the ending time can't be lower than the start and can't be higher than 24 hours
    const aDayInMs = 86400000;
    if (this.iE(this.to) || this.to > aDayInMs || this.from > this.to) e.push('to');
    return e;
  }

  /**
   * Get the duration of the interval (ms).
   */
  getDuration(): number {
    return (this.to || 0) - (this.from || 0);
  }

  /**
   * Whether the interval is set.
   */
  isSet(): boolean {
    return this.getDuration() > 0;
  }

  /**
   * Reset the interval.
   */
  reset(): void {
    this.from = 0;
    this.to = 0;
  }
}
