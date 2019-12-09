import { Resource } from './resource.model';
import { CustomFieldTypes } from './customFieldTypes.enum';
import { Label } from './label.model';
import { Languages } from './languages.model';
import { Suggestion } from './suggestion.model';

export class CustomFieldMeta extends Resource {
  /**
   * The id of the team owning the field. Optional.
   */
  public teamId?: string;
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
   * The translations of the enum keys; available only with type ENUM.
   * Not obligatory: the fallback is always the enum key.
   */
  public enumLabels: { [key: string]: Label };
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
    super.load(x, languages);
    if (x.teamId) this.clean(x.teamId, String);
    this.fieldId = this.clean(x.fieldId, String);
    this.name = new Label(x.name, languages);
    this.description = new Label(x.description, languages);
    this.type = this.clean(x.type, String, CustomFieldTypes.STRING);
    this.enum = this.cleanArray(x.enum, String);
    this.enumLabels = {};
    if (x.enumLabels) this.enum.forEach(e => (this.enumLabels[e] = new Label(x.enumLabels[e], languages)));
    switch (this.type) {
      case CustomFieldTypes.STRING:
      case CustomFieldTypes.TEXT:
      case CustomFieldTypes.ENUM:
        this.default = this.clean(x.default, String);
        break;
      case CustomFieldTypes.NUMBER:
        this.default = this.clean(x.default, Number);
        break;
      case CustomFieldTypes.BOOLEAN:
        this.default = this.clean(x.default, Boolean);
        break;
    }
    this.obligatory = this.clean(x.obligatory, Boolean);
    this.min = this.clean(x.min, Number);
    this.max = this.clean(x.max, Number);
    this.icon = this.clean(x.icon, String);
  }

  public safeLoad(newData: any, safeData: any, languages?: Languages) {
    super.safeLoad(newData, safeData, languages);
    if (safeData.teamId) this.teamId = safeData.teamId;
    this.fieldId = safeData.fieldId;
  }

  public validate(languages?: Languages): Array<string> {
    const e = super.validate();
    if (this.name.validate(languages).length) e.push(`name`);
    if (this.type === CustomFieldTypes.ENUM && !(this.enum && this.enum.length)) e.push(`enum`);
    return e;
  }

  /**
   * Set a default value for the field, based on its type.
   * @param field the field to check
   * @return the determinated default value, based on the type
   */
  public fieldDefaultValue(): any {
    let field: any = this.default || null;
    // if a default value is not set, force based on type
    if (!field)
      switch (this.type) {
        case CustomFieldTypes.STRING:
        case CustomFieldTypes.TEXT:
        case CustomFieldTypes.ENUM:
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
  public loadField(newField: any): any {
    let field: any;
    switch (this.type) {
      case CustomFieldTypes.STRING:
      case CustomFieldTypes.TEXT:
      case CustomFieldTypes.ENUM:
        field = this.clean(newField, String);
        break;
      case CustomFieldTypes.NUMBER:
        field = this.clean(newField, Number, 0);
        break;
      case CustomFieldTypes.BOOLEAN:
        field = this.clean(newField, Boolean);
        break;
      default:
        field = null;
    }
    return field;
  }

  /**
   * Validate a field value, based on the field configuration.
   * @param field the value to check
   * @return return false in case of error
   */
  public validateField(field: any): boolean {
    // obligatory fields check
    if (this.obligatory)
      switch (this.type) {
        case CustomFieldTypes.STRING:
        case CustomFieldTypes.TEXT:
        case CustomFieldTypes.ENUM:
          if (!field || !String(field).length) return false;
          break;
        case CustomFieldTypes.NUMBER:
          if ((!field && field !== 0) || isNaN(field)) return false;
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
    return true;
  }

  /**
   * Get the label to show for the enum, based on the translations available; if none, returns the key.
   */
  public getEnumElement(enumKey: string, language?: string, languages?: Languages): string {
    if (this.type !== CustomFieldTypes.ENUM) return null;
    if (
      !this.enumLabels ||
      !this.enumLabels[enumKey] ||
      !(this.enumLabels[enumKey] instanceof Label) ||
      !language ||
      !languages
    )
      return enumKey;
    else return this.enumLabels[enumKey].translate(language, languages) || enumKey;
  }
  /**
   * Get the enum in the form of array of Suggestions.
   */
  public getEnumAsSuggestion(language?: string, languages?: Languages): Array<Suggestion> {
    if (this.type !== CustomFieldTypes.ENUM) return [];
    else return this.enum.map(e => new Suggestion({ value: e, name: this.getEnumElement(e, language, languages) }));
  }
}
