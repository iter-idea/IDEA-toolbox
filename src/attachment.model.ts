/**
 * An attachment to attach to a resource.
 */
export class Attachment {
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
    x = (x || {}) as Attachment;
    this.attachmentId = x.attachmentId ? String(x.attachmentId) : null;
    this.name = x.name ? String(x.name) : null;
    this.format = x.format ? String(x.format) : null;
  }
}
