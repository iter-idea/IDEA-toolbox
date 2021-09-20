import { Resource } from './resource.model';

/**
 * A suggestion made to appear as value to select.
 */
export class Suggestion extends Resource {
  /**
   * The value; it could be of any type.
   */
  value: any;
  /**
   * The name to show for the suggestion.
   */
  name: string;
  /**
   * A description with additional information on the suggestion.
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
    super.load(x);
    this.value = x.value;
    this.name = this.clean(x.name, String);
    this.description = this.clean(x.description, String);
    this.category1 = this.clean(x.category1, String);
    this.category2 = this.clean(x.category2, String);
  }

  /**
   * Clear the suggestion.
   */
  clear() {
    this.value = null;
    this.name = null;
    this.description = null;
    this.category1 = null;
    this.category2 = null;
  }
}
