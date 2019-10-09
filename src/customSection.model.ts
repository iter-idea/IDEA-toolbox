import { Resource } from './resource.model';
import { CustomField } from './customField.model';
import { Label } from './label.model';

/**
 * A custom section containing any number of custom fields.
 */
export class CustomSection extends Resource {
  /**
   * The name of the section. Support to multilanguage.
   */
  public name: Label;
  /**
   * Ordered list of the fields (names) to expect in the section.
   * Example: `['name', 'surname', ...]`.
   */
  public fieldsLegend: Array<string>;
  /**
   * Object containg attributes of type CustomField; e.g.
   * ```
   * fields.name: CustomField;
   * fields.surname: CustomField;
   * ...
   * ```
   */
  public fields: CustomFields;
  /**
   * Matrix that sets the way the section is shown in the template; when null, a section won't be shown in the template.
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
  public displayTemplate: Array<Array<string>>;

  constructor(availableLanguages?: Array<string>) {
    super();
    this.name = new Label(availableLanguages);
    this.fieldsLegend = new Array<string>();
    this.fields = {};
    this.displayTemplate = new Array<Array<string>>();
  }

  public load(x: any, availableLanguages?: Array<string>) {
    super.load(x);
    this.name = new Label(availableLanguages, x.name);
    this.fieldsLegend = this.clean(x.fieldsLegend, String);
    this.fields = {};
    this.fieldsLegend.forEach(f => (this.fields[f] = new CustomField(x.fields[f])));
    this.displayTemplate = (x.displayTemplate || []).map((z: Array<string>) => this.clean(z, String));
  }

  public safeLoad(newData: any, safeData: any, availableLanguages?: Array<string>) {
    super.safeLoad(newData, safeData);
    this.load(newData, availableLanguages);
  }

  public validate(defaultLanguage?: string): Array<string> {
    let e = super.validate();
    e = e.concat(this.name.validate(defaultLanguage));
    this.fieldsLegend.forEach(f => e.concat(this.fields[f].validate()));
    return e;
  }
}

/**
 * Dynamic object that supports only _key -> values_ of type CustomField.
 */
export interface CustomFields {
  [index: string]: CustomField;
}
