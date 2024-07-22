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
  name?: Label;
  /**
   * The description of the section. Support to multilanguage. Optional.
   */
  description?: Label;
  /**
   * Ordered list of the fields (names) to expect in the section.
   * Example: `['name', 'surname', ...]`.
   */
  fieldsLegend: string[];
  /**
   * Object containg attributes of type CustomFieldMeta; e.g.
   * ```
   * fields.name: CustomFieldMeta;
   * fields.surname: CustomFieldMeta;
   * ...
   * ```
   */
  fields: CustomFieldsMeta;
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
  displayTemplate?: string[][];

  load(x: any, languages: Languages): void {
    super.load(x);
    if (x.name) this.name = new Label(x.name, languages);
    if (x.description) this.description = new Label(x.description, languages);
    this.fieldsLegend = this.cleanArray(x.fieldsLegend, String);
    this.fields = {};
    x.fields = x.fields ?? {};
    this.fieldsLegend.forEach(f => (this.fields[f] = new CustomFieldMeta(x.fields[f], languages)));
    if (x.displayTemplate)
      this.displayTemplate = (x.displayTemplate ?? []).map((z: string[]): any[] =>
        this.cleanArray(z, String)
          // filter out of the displayTemplate the fields which aren't in the fieldsLegend
          .filter(dpf => this.fieldsLegend.some(f => f === dpf))
      );
  }

  validate(languages: Languages): string[] {
    const e = super.validate();
    this.fieldsLegend.forEach(f => this.fields[f].validate(languages).forEach(ea => e.push(`${f}.${ea}`)));
    return e;
  }

  /**
   * Set the default values of the specified fields.
   */
  setFieldsDefaultValues(): any {
    const fields: any = {};
    this.fieldsLegend.forEach(f => (fields[f] = this.fields[f].fieldDefaultValue()));
    return fields;
  }

  /**
   * Load the values of the specified fields.
   * @param newFields the values to set in the fields
   */
  loadFields(newFields: any): any {
    const fields: any = {};
    newFields = newFields ?? {};
    this.fieldsLegend.forEach(f => (fields[f] = this.fields[f].loadField(newFields[f])));
    return fields;
  }

  /**
   * Validate the fields and return an array with errors, if any.
   */
  validateFields(fields: any): string[] {
    fields = fields ?? {};
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
