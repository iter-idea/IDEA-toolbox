import { Resource } from './resource.model';
import { CustomFieldTypes } from './customFieldTypes.enum';
import { Label } from './label.model';
import { Languages } from './languages.model';

export class CustomFieldMeta extends Resource {
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

  public load(x: any, languages?: Languages) {
    super.load(x);
    this.fieldId = this.clean(x.fieldId, String);
    this.name = new Label(x.name, languages);
    this.description = new Label(x.description, languages);
    this.type = this.clean(x.type, String, CustomFieldTypes.STRING);
    this.enum = this.clean(x.enum, String);
    this.default = this.clean(x.default, String);
    this.obligatory = this.clean(x.obligatory, Boolean);
    this.default = this.clean(x.default, Number);
    this.min = this.clean(x.min, Number);
    this.max = this.clean(x.max, Number);
    this.icon = this.clean(x.icon, String);
  }

  public safeLoad(newData: any, safeData: any, languages?: Languages) {
    super.safeLoad(newData, safeData, languages);
    this.fieldId = safeData.fieldId;
  }

  public validate(languages?: Languages): Array<string> {
    let e = super.validate();
    e = e.concat(this.name.validate(languages));
    if (this.type === CustomFieldTypes.ENUM && !(this.enum && this.enum.length)) e.push(`enum`);
    return e;
  }

  /**
   * Set a default value for the field, based on its type.
   * @param field the field to check
   * @return the determinated default value, based on the type
   */
  public fieldDefaultValue(field: any): any {
    field = this.default || null;
    // if a default value is not set, force based on type
    if (!field)
      switch (this.type) {
        case CustomFieldTypes.STRING:
        case CustomFieldTypes.TEXT:
          field = null;
          break;
        case CustomFieldTypes.NUMBER:
          field = 0;
          break;
        case CustomFieldTypes.BOOLEAN:
          field = false;
          break;
      }
    return field;
  }

  /**
   * Load a value based on the field configuration.
   * @param field the value to load
   */
  public loadField(field: any): any {
    switch (this.type) {
      case CustomFieldTypes.STRING:
      case CustomFieldTypes.TEXT:
        field = this.clean(field, String);
        break;
      case CustomFieldTypes.NUMBER:
        field = this.clean(field, Number, 0);
        break;
      case CustomFieldTypes.BOOLEAN:
        field = this.clean(field, Boolean);
        break;
      default:
        field = null;
    }
    return field;
  }

  /**
   * Validate a field value, based on the field configuration.
   * @param field the value to check
   * @return return the cleaned value or false in case of error
   */
  public validateField(field: any): any {
    if (!field) return false;
    // force cast based on type
    switch (this.type) {
      case CustomFieldTypes.BOOLEAN:
        field = Boolean(field);
        break;
      case CustomFieldTypes.STRING:
      case CustomFieldTypes.TEXT:
      case CustomFieldTypes.ENUM:
        field = String(field).trim();
        break;
      case CustomFieldTypes.NUMBER:
        field = Number(field);
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
          if (!field.length) return false;
          break;
        case CustomFieldTypes.NUMBER:
          if (isNaN(field) || field === 0) return false;
          break;
      }
    // interval check
    if (this.type === CustomFieldTypes.NUMBER) {
      if (this.min !== null && this.min !== undefined) if (field < this.min) return false;
      if (this.max !== null && this.max !== undefined) if (field > this.max) return false;
    }
    // enum check
    if (this.type === CustomFieldTypes.ENUM && !(this.enum || []).some(x => x === field)) return false;
    // return the value cleaned and forced
    return field;
  }
}
