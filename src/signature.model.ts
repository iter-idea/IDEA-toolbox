import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * The signature, composed by a signatory and various dataURI formats.
 */
export class Signature extends Resource {
  /**
   * The contact who signed.
   */
  public signatory: string;
  /**
   * The timestamp of the signature.
   */
  public timestamp: epochDateTime;
  /**
   * The PNG representation of the signature.
   */
  public pngURL?: string;
  /**
   * The JPEG representation of the signature.
   */
  public jpegURL?: string;

  public load(x: any) {
    super.load(x);
    this.signatory = this.clean(x.signatory, String);
    this.timestamp = this.clean(x.timestamp, t => new Date(t).getTime(), Date.now()) as epochDateTime;
    if (x.pngURL) this.pngURL = this.clean(x.pngURL, String);
    if (x.jpegURL) this.jpegURL = this.clean(x.jpegURL, String);
  }

  /**
   * Check whether the signature object has the same content of another one.
   */
  public isSame(otherSignature: Signature, skipSignatory?: boolean): boolean {
    return (
      this.pngURL === otherSignature.pngURL &&
      this.jpegURL === otherSignature.jpegURL &&
      this.timestamp === otherSignature.timestamp &&
      (skipSignatory || this.signatory === otherSignature.signatory)
    );
  }
}
