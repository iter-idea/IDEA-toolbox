import { Resource } from './resource.model';

/**
 * An interval between two moments of the same day.
 * Note well: the timestamps should be stored and displayed considering UTC time (i.e. without any timezone).
 */
export class TimeInterval extends Resource {
  /**
   * The moment in the day (UTC), when the interval starts; in ms.
   */
  public from: number;
  /**
   * The moment in the day (UTC), when the interval ends; in ms.
   */
  public to: number;

  public load(x: any) {
    super.load(x);
    this.from = this.clean(x.from, Number, 0);
    this.to = this.clean(x.to, Number, 0);
  }

  public validate(): Array<string> {
    const e = super.validate();
    // the starting time can't be lower than 0
    if (this.iE(this.from) || this.from < 0) e.push('from');
    // the ending time can't be lower than the start and can't be higher than 24 hours
    const aDayInMs = 86400000;
    if (this.iE(this.to) || this.to > aDayInMs || this.from > this.to) e.push('to');
    return e;
  }

  /**
   * Get the duration of the interval (ms).
   */
  public getDuration(): number {
    return (this.to || 0) - (this.from || 0);
  }

  /**
   * Whether the interval is set.
   */
  public isSet(): boolean {
    return this.getDuration() > 0;
  }

  /**
   * Reset the interval.
   */
  public reset() {
    this.from = 0;
    this.to = 0;
  }
}
