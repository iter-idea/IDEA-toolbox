import { Resource } from './resource.model';

/**
 * An attachment to attach to a resource.
 */
export class Attachment extends Resource {
  /**
   * The id of the attachment.
   */
  attachmentId: string;
  /**
   * The name of the resource. This can be changed when attaching to the resource.
   */
  name: string;
  /**
   * The format of the resource. (e.g. 'jpg', 'pdf').
   */
  format: string;

  load(x: any) {
    super.load(x);
    this.attachmentId = this.clean(x.attachmentId, String);
    this.name = this.clean(x.name, String);
    this.format = this.clean(x.format, String);
  }

  safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.attachmentId = safeData.attachmentId;
    this.format = safeData.format;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.attachmentId)) e.push('attachmentId');
    if (this.iE(this.name)) e.push('name');
    if (this.iE(this.format)) e.push('format');
    return e;
  }
}
