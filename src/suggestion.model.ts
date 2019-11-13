import { Resource } from './resource.model';

/**
 * A suggestion made to appear as value to select.
 */
export class Suggestion extends Resource {
  /**
   * The value; it could be of any type.
   */
  public value: any;
  /**
   * The name to show for the suggestion.
   */
  public name: string;
  /**
   * An optional first category.
   */
  public category1: any;
  /**
   * An optional second category.
   */
  public category2: any;

  public load(x?: any) {
    super.load(x);
    this.value = x.value;
    this.name = this.clean(x.name, String);
    this.category1 = this.clean(x.category1, String);
    this.category2 = this.clean(x.category2, String);
  }

  /**
   * Clear the suggestion.
   */
  public clear() {
    this.value = null;
    this.name = null;
    this.category1 = null;
    this.category2 = null;
  }
}
