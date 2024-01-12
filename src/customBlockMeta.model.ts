import { Resource } from './resource.model';
import { CustomSectionMeta } from './customSectionMeta.model';
import { Languages } from './languages.model';

export class CustomBlockMeta extends Resource {
  /**
   * Ordered list of the sections (names) to expect in the block.
   * Example: `['flowers', 'burgers', ...]`.
   */
  sectionsLegend: string[];
  /**
   * Object containg attributes of type CustomSectionMeta; e.g.
   * ´´´
   * fields.flowers: CustomSectionMeta;
   * fields.burgers: CustomSectionMeta;
   * ...
   * ```
   */
  sections: CustomSectionsMeta;

  load(x: any, languages: Languages): void {
    super.load(x, languages);
    this.sectionsLegend = this.cleanArray(x.sectionsLegend, String);
    this.sections = {};
    this.sectionsLegend.forEach(s => (this.sections[s] = new CustomSectionMeta(x.sections[s], languages)));
  }

  validate(languages: Languages): string[] {
    const e = super.validate();
    this.sectionsLegend.forEach(s => this.sections[s].validate(languages).forEach(es => e.push(`${s}.${es}`)));
    return e;
  }

  /**
   * Set the default values of the specified sections.
   */
  setSectionsDefaultValues(): any {
    const sections: any = {};
    this.sectionsLegend.forEach(s => (sections[s] = this.sections[s].setFieldsDefaultValues()));
    return sections;
  }

  /**
   * Load the values of the specified sections.
   * @param sections the sections target of the load action
   * @param newSections the values to set in the sections
   */
  loadSections(newSections: any): any {
    const sections: any = {};
    newSections = newSections || {};
    this.sectionsLegend.forEach(s => (sections[s] = this.sections[s].loadFields(newSections[s])));
    return sections;
  }

  /**
   * Validate the sections and return an array with errors, if any.
   */
  validateSections(sections: any): string[] {
    sections = sections || {};
    const e = new Array<string>();
    this.sectionsLegend.forEach(s => this.sections[s].validateFields(sections[s]).forEach(ef => e.push(`${s}.${ef}`)));
    return e;
  }
}

/**
 * Dynamic object that supports only _key -> values_ of type CustomSectionMeta.
 */
export interface CustomSectionsMeta {
  [index: string]: CustomSectionMeta;
}
