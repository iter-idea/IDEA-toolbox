import { Resource } from './resource.model';

export class Check extends Resource {
  /**
   * The unique identifier for the check element.
   */
  value: string | number;
  /**
   * Displayed name (description) of the check element.
   */
  name: string;
  /**
   * Whether the check is true or false.
   */
  checked: boolean;
  /**
   * Elements not included in the current search because of other filters.
   */
  hidden: boolean;
  /**
   * URL to an avatar to display for the element.
   */
  avatar: string;
  /**
   * The color shape to display (instead of an avatar) for the element.
   */
  color: string;
  /**
   * A description with additional information on the check.
   */
  description: string;
  /**
   * An optional first category.
   */
  category1: any;
  /**
   * An optional second category.
   */
  category2: any;

  load(x?: any) {
    if (x) x = typeof x === 'object' ? x : { value: x }; // backward compatibility
    super.load(x);
    this.value = this.clean(x.value, v => (typeof v === 'number' ? Number(v) : String(v)));
    this.name = x.name ? this.clean(x.name, String) : String(this.value);
    this.checked = this.clean(x.checked, Boolean);
    this.hidden = this.clean(x.hidden, Boolean);
    this.avatar = this.clean(x.avatar, String);
    this.color = this.clean(x.color, String);
    this.description = this.clean(x.description, String);
    this.category1 = this.clean(x.category1, String);
    this.category2 = this.clean(x.category2, String);
  }
}
