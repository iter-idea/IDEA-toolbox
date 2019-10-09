import { Resource } from './resource.model';
import { CustomFieldTypes } from './customFieldTypes.enum';
import { Label } from './label.model';

export class CustomField extends Resource {
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

  public load(x: any, availableLanguages?: Array<string>) {
    super.load(x);
    this.fieldId = this.clean(x.fieldId, String);
    this.name = new Label(availableLanguages, x.name);
    this.description = new Label(availableLanguages, x.description);
    this.type = this.clean(x.type, String, CustomFieldTypes.STRING);
    this.enum = this.clean(x.enum, String);
    this.default = this.clean(x.default, String);
    this.obligatory = this.clean(x.obligatory, Boolean);
    this.default = this.clean(x.default, Number);
    this.min = this.clean(x.min, Number);
    this.max = this.clean(x.max, Number);
    this.icon = this.clean(x.icon, String);
  }

  public safeLoad(newData: any, safeData: any, availableLanguages?: Array<string>) {
    super.safeLoad(newData, safeData, availableLanguages);
    this.fieldId = safeData.fieldId;
  }

  public validate(defaultLanguage?: string): Array<string> {
    let e = super.validate();
    e = e.concat(this.name.validate(defaultLanguage));
    if (this.type === CustomFieldTypes.ENUM && !(this.enum && this.enum.length)) e.push(`enum`);
    return e;
  }

  /**
   * Check a value based on the field configuration.
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
