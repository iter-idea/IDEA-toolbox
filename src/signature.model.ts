import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * The signature, composed by a signatory and various dataURL formats.
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
  public pngURL: string;

  public load(x: any) {
    super.load(x);
    this.signatory = this.clean(x.signatory, String);
    this.timestamp = this.clean(x.timestamp, t => new Date(t).getTime(), Date.now()) as epochDateTime;
    this.pngURL = this.clean(x.pngURL, String);
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.signatory)) e.push('signatory');
    if (this.iE(this.timestamp)) e.push('timestamp');
    if (this.iE(this.pngURL)) e.push('pngURL');
    return e;
  }

  /**
   * Check whether the signature object has the same content of another one.
   */
  public isSame(otherSignature: Signature, skipSignatory?: boolean): boolean {
    return (
      otherSignature &&
      this.timestamp === otherSignature.timestamp &&
      this.pngURL === otherSignature.pngURL &&
      (skipSignatory || this.signatory === otherSignature.signatory)
    );
  }
}
