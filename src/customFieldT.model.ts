import { Resource } from './resource.model';
import { CustomFieldTypes } from './customFieldTypes.enum';
import { Label } from './label.model';

export class CustomFieldT extends Resource {
  /**
   * Id of the field.
   */
  public fieldId: string;
  /**
   * Name of the field.
   */
  public name: Label;
  /**
   * Explanation of the field.
   */
  public description: Label;
  /**
   * The type of the custom field.
   */
  public type: CustomFieldTypes;
  /**
   * The list of the possible values (strings); available only with type ENUM.
   */
  public enum: Array<string>;
  /**
   * Field default value.
   */
  public default: any;
  /**
   * If true, an obligatory check will be performed; ignored with type BOOLEAN.
   */
  public obligatory: boolean;
  /**
   * Min value the field can assume; available only with type NUMBER.
   */
  public min: number;
  /**
   * Max value the field can assume; available only with type NUMBER.
   */
  public max: number;
  /**
   * The icon to show to identify the field.
   */
  public icon: string;

  constructor(availableLanguages?: Array<string>) {
    super();
    this.fieldId = null;
    this.name = {} as Label;
    availableLanguages.forEach(l => (this.name[l] = null));
    this.description = {} as Label;
    availableLanguages.forEach(l => (this.description[l] = null));
    this.type = CustomFieldTypes.STRING;
    this.enum = null;
    this.default = null;
    this.obligatory = null;
    this.min = null;
    this.max = null;
    this.icon = null;
  }

  public load(x: any, availableLanguages?: Array<string>) {
    super.load(x);
    this.fieldId = x.fieldId ? String(x.fieldId) : null;
    availableLanguages = availableLanguages || [];
    this.name = {} as Label;
    availableLanguages.forEach(l => (this.name[l] = x.name[l] ? String(x.name[l]) : null));
    this.description = {} as Label;
    availableLanguages.forEach(l => (this.description[l] = x.description[l] ? String(x.description[l]) : null));
    this.type = x.type ? (String(x.type) as CustomFieldTypes) : null;
    this.enum = x.enum ? x.enum.map((y: string) => (y ? String(y) : null)) : null;
    this.default = x.default ? String(x.default) : null;
    this.obligatory = Boolean(x.obligatory);
    this.min = x.min ? Number(x.min) : null;
    this.max = x.max ? Number(x.max) : null;
    this.icon = x.icon ? String(x.icon) : null;
  }

  public safeLoad(newData: any, safeData: any, availableLanguages?: Array<string>): void {
    super.safeLoad(newData, safeData);
    this.load(newData, availableLanguages);
    this.fieldId = safeData.fieldId;
  }

  public validate(defaultLanguage?: string): Array<string> {
    super.validate();
    const e: Array<string> = new Array<string>();
    //
    if (this.iE(defaultLanguage)) e.push('defaultLanguage');
    //
    if (this.iE(this.name[defaultLanguage])) e.push(`name`);
    if (this.type === CustomFieldTypes.ENUM && !(this.enum && this.enum.length)) e.push(`enum`);
    //
    return e;
  }

  /**
   * Check a value following the field configuration.
   * @param value the value to check
   * @return the value type-forced and cleaned
   */
  protected check(value: any): any {
    if (!value) return false;
    // force cast based on type
    switch (this.type) {
      case CustomFieldTypes.BOOLEAN:
        value = Boolean(value);
        break;
      case CustomFieldTypes.STRING:
      case CustomFieldTypes.TEXT:
      case CustomFieldTypes.ENUM:
        value = String(value).trim();
        break;
      case CustomFieldTypes.NUMBER:
        value = Number(value);
        break;
      default:
        return false;
    }
    // obligatory fields check
    if (this.obligatory)
      switch (this.type) {
        case CustomFieldTypes.STRING:
        case CustomFieldTypes.TEXT:
        case CustomFieldTypes.ENUM:
          if (!value.length) return false;
          break;
        case CustomFieldTypes.NUMBER:
          if (isNaN(value) || value === 0) return false;
          break;
      }
    // interval check
    if (this.type === CustomFieldTypes.NUMBER) {
      if (this.min !== null && this.min !== undefined) if (value < this.min) return false;
      if (this.max !== null && this.max !== undefined) if (value > this.max) return false;
    }
    // enum check
    if (this.type === CustomFieldTypes.ENUM && !(this.enum || []).some(x => x === value)) return false;
    // return the value cleaned and forced
    return value;
  }
}
