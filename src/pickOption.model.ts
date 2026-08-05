import { Resource } from './resource.model';

/**
 * The plain shape of a `PickOption`: what you can write inline, without building the class.
 * Only the value is required, since the name falls back to it.
 */
export interface PickOptionLike<T = any> {
  value: string | number;
  name?: string;
  group?: string;
  description?: string;
  item?: T;
}

/**
 * An option that can be picked from a list, whether the pick is single or multiple.
 *
 * It doesn't carry the selection: that belongs to whoever owns the value.
 * Note: `item` is a free slot to keep the object the option was built from, so that the picked value can be
 * resolved back to the domain without looking it up again.
 */
export class PickOption<T = any> extends Resource {
  /**
   * The unique identifier of the option.
   */
  value: string | number;
  /**
   * The label to show; it falls back to the value.
   */
  name: string;
  /**
   * What qualifies the option among the others, e.g. the customer of a location or the country of a section.
   * When at least two options have a different one, the list shows it as a section heading.
   */
  group: string;
  /**
   * Additional information, shown below the name.
   */
  description: string;
  /**
   * The object the option was built from; it's kept as-is and never shown.
   */
  item?: T;

  load(x?: any): void {
    super.load(x);
    this.value = this.clean(x.value, v => (typeof v === 'number' ? Number(v) : String(v)));
    this.name = x.name ? this.clean(x.name, String) : String(this.value);
    this.group = this.clean(x.group, String);
    this.description = this.clean(x.description, String);
    if (x.item !== undefined) this.item = x.item;
  }

  /**
   * Build a list of options from plain objects, leaving the ones that already are options untouched.
   * Note: it returns a new array every time, so don't call it on a value that is recreated on every
   * change detection (an inline literal in a template): keep the list in a field or a computed.
   */
  static list<T = any>(options?: (PickOption<T> | PickOptionLike<T>)[]): PickOption<T>[] {
    return (options ?? []).map(x => (x instanceof PickOption ? x : new PickOption<T>(x)));
  }

  /**
   * Whether the option matches a search query, on any of the text it shows.
   */
  matches(query: string): boolean {
    if (!query) return true;
    const searchable = [this.name, String(this.value), this.group, this.description]
      .filter(x => x)
      .join(' ')
      .toLowerCase();
    return query
      .toLowerCase()
      .split(' ')
      .filter(x => x)
      .every(term => searchable.includes(term));
  }
}
