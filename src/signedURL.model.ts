import { Resource } from './resource.model';

/**
 * Signed URL with additional metadata.
 */
export class SignedURL extends Resource {
  /**
   * The signed URL.
   */
  public url: string;
  /**
   * An optional identificator for various purposes.
   */
  public id?: string;

  public load(x: any) {
    super.load(x);
    this.url = this.clean(x.url, String);
    if (x.id) this.id = this.clean(x.id, String);
  }
}
