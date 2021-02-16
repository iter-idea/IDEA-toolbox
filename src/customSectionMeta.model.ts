import { Resource } from './resource.model';
import { CustomFieldMeta } from './customFieldMeta.model';
import { Label } from './label.model';
import { Languages } from './languages.model';

/**
 * A custom section meta containing any number of custom fields meta.
 */
export class CustomSectionMeta extends Resource {
  /**
   * The name of the section. Support to multilanguage. Optional.
   */
  public name?: Label;
  /**
   * The description of the section. Support to multilanguage. Optional.
   */
  public description?: Label;
  /**
   * Ordered list of the fields (names) to expect in the section.
   * Example: `['name', 'surname', ...]`.
   */
  public fieldsLegend: string[];
  /**
   * Object containg attributes of type CustomFieldMeta; e.g.
   * ```
   * fields.name: CustomFieldMeta;
   * fields.surname: CustomFieldMeta;
   * ...
   * ```
   */
  public fields: CustomFieldsMeta;
  /**
   * Matrix that sets the way the section is shown in the template; when null, a section won't be shown in the template.
   * Optional.
   *
   * Example, with f1, f2, etc. as fields names,
   * ```
   * [ ['f1'], ['f2','f3','f7'], ['f5','f8'] ]
   * ```
   * becomes:
   * ```
   * [      f1      ]
   * [ f2 | f3 | f7 ]
   * [  f5   |  f8  ]
   * ```
   */
  public displayTemplate?: string[][];

  public load(x: any, languages: Languages) {
    super.load(x);
    if (x.name) this.name = new Label(x.name, languages);
    if (x.description) this.description = new Label(x.description, languages);
    this.fieldsLegend = this.cleanArray(x.fieldsLegend, String);
    this.fields = {};
    x.fields = x.fields || {};
    this.fieldsLegend.forEach(f => (this.fields[f] = new CustomFieldMeta(x.fields[f], languages)));
    if (x.displayTemplate)
      this.displayTemplate = (x.displayTemplate || []).map((z: string[]) =>
        this.cleanArray(z, String)
          // filter out of the displayTemplate the fields which aren't in the fieldsLegend
          .filter(dpf => this.fieldsLegend.some(f => f === dpf))
      );
  }

  public validate(languages: Languages): string[] {
    const e = super.validate();
    this.fieldsLegend.forEach(f => this.fields[f].validate(languages).forEach(ea => e.push(`${f}.${ea}`)));
    return e;
  }

  /**
   * Set the default values of the specified fields.
   */
  public setFieldsDefaultValues() {
    const fields: any = {};
    this.fieldsLegend.forEach(f => (fields[f] = this.fields[f].fieldDefaultValue()));
    return fields;
  }

  /**
   * Load the values of the specified fields.
   * @param fields the fields target of the load action
   * @param newFields the values to set in the fields
   */
  public loadFields(newFields: any): any {
    const fields: any = {};
    newFields = newFields || {};
    this.fieldsLegend.forEach(f => (fields[f] = this.fields[f].loadField(newFields[f])));
    return fields;
  }

  /**
   * Validate the fields and return an array with errors, if any.
   */
  public validateFields(fields: any): string[] {
    fields = fields || {};
    const e = new Array<string>();
    this.fieldsLegend.forEach(f => (!this.fields[f].validateField(fields[f]) ? e.push(f) : null));
    return e;
  }
}

/**
 * Dynamic object that supports only _key -> values_ of type CustomFieldMeta.
 */
export interface CustomFieldsMeta {
  [index: string]: CustomFieldMeta;
}
