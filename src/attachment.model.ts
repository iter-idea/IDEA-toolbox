import { Resource } from './resource.model';

/**
 * An attachment to attach to a resource.
 */
export class Attachment extends Resource {
  /**
   * The id of the attachment.
   */
  public attachmentId: string;
  /**
   * The name of the resource. This can be changed when attaching to the resource.
   */
  public name: string;
  /**
   * The format of the resource. (e.g. 'jpg', 'pdf').
   */
  public format: string;

  constructor(x?: Attachment | any) {
    super();
    this.attachmentId = null;
    this.name = null;
    this.format = null;
    if (x) this.load(x);
  }

  public load(x: any) {
    super.load(x);
    this.attachmentId = x.attachmentId ? String(x.attachmentId) : null;
    this.name = x.name ? String(x.name) : null;
    this.format = x.format ? String(x.format) : null;
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.attachmentId = safeData.attachmentId;
    this.format = safeData.format;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.attachmentId)) e.push(`attachmentId`);
    if (this.iE(this.name)) e.push(`name`);
    if (this.iE(this.format)) e.push(`format`);
    return e;
  }
}
