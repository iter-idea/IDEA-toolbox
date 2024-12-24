import { Label } from './label.model';
import { Languages } from './languages.model';
import { Resource } from './resource.model';

/**
 * An attachment to stick to an entity.
 */
export class Attachment extends Resource {
  /**
   * The ID of the attachment.
   */
  attachmentId: string;
  /**
   * The name of the attachment.
   */
  name: string;
  /**
   * The format of the attachment, without a prefixing dot (e.g. 'jpg', 'pdf').
   */
  format: string;

  load(x: any): void {
    super.load(x);
    this.attachmentId = this.clean(x.attachmentId, String);
    this.name = this.clean(x.name, String);
    this.format = this.clean(x.format, String);
  }

  safeLoad(newData: any, safeData: any): void {
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

  /**
   * Get the filename (`name.format`) of the attachment.
   */
  getFilename(): string {
    return this.name.concat('.', this.format);
  }
}

/**
 * A section to group a list of attachments.
 */
export class AttachmentSection extends Resource {
  /**
   * The name of the section (multilanguage).
   */
  name: Label;
  /**
   * The description of the section (multilanguage).
   */
  description: Label;
  /**
   * The list of attachments in the section.
   */
  attachments: Attachment[];

  load(x: any, languages: Languages): void {
    super.load(x);
    this.name = new Label(x.name, languages);
    this.description = new Label(x.description, languages);
    this.attachments = this.cleanArray(x.attachments, a => new Attachment(a));
  }

  validate(languages: Languages): string[] {
    const e = super.validate();
    if (this.name.validate(languages).length) e.push('name');
    return e;
  }
}

/**
 * A block of reorderable sections each containing a list of attachments.
 * Use it when you need to organize the attachments in sections or categories.
 */
export class AttachmentSections extends Resource {
  /**
   * Ordered list of the sections (keys) to expect in the block.
   * Example: `['flowers', 'burgers', ...]`.
   */
  sectionsLegend: string[];
  /**
   * Object containg attributes of type AttachmentSection; e.g.
   * ```
   * sections.flowers: AttachmentSection;
   * sections.burgers: AttachmentSection;
   * ...
   * ```
   */
  sections: Record<string, AttachmentSection>;

  load(x: any, languages: Languages): void {
    super.load(x, languages);
    this.sectionsLegend = this.cleanArray(x.sectionsLegend, String);
    this.sections = {};
    this.sectionsLegend.forEach(s => (this.sections[s] = new AttachmentSection(x.sections[s], languages)));
  }

  validate(languages: Languages): string[] {
    const e = super.validate();
    this.sectionsLegend.forEach(s => this.sections[s].validate(languages).forEach(es => e.push(`${s}.${es}`)));
    return e;
  }
}
