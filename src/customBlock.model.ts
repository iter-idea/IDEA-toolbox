import { Resource } from './resource.model';
import { CustomSection } from './customSection.model';

export class CustomBlock extends Resource {
  /**
   * Ordered list of the sections (names) to expect in the block.
   * Example: `['flowers', 'burgers', ...]`.
   */
  public sectionsLegend: Array<string>;
  /**
   * Object containg attributes of type CustomSection; e.g.
   * ´´´
   * fields.flowers: CustomSection;
   * fields.burgers: CustomSection;
   * ...
   * ```
   */
  public sections: CustomSections;

  public load(x: any) {
    super.load(x);
    this.sectionsLegend = this.cleanArray(x.sectionsLegend, String);
    this.sections = {};
    this.sectionsLegend.forEach(s => (this.sections[s] = new CustomSection(x.sections[s])));
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
  }

  public validate(): Array<string> {
    const e = super.validate();
    this.sectionsLegend.forEach(s => e.concat(this.sections[s].validate()));
    return e;
  }
}

/**
 * Dynamic object that supports only _key -> values_ of type CustomSection.
 */
export interface CustomSections {
  [index: string]: CustomSection;
}
