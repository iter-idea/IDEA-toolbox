import { Resource } from './resource.model';

export class Languages extends Resource {
  /**
   * The default language for a context (e.g. 'it', 'en', etc.).
   */
  public default: string;
  /**
   * The available languages available in a context (e.g. 'it', 'en', etc.).
   */
  public available: Array<string>;

  public load(x: any) {
    super.load(x);
    this.default = this.clean(x.default, String, 'en');
    this.available = this.cleanArray(x.available, String, ['en']);
  }

  public validate() {
    const e = super.validate();
    if (!this.default) e.push('default');
    if (!this.available.some(x => x === this.default)) e.push('available');
    return e;
  }
}
