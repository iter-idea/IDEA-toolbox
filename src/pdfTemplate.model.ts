import { Label } from './label.model';
import { LabelVariable } from './labelVariable.model';
import { Languages } from './languages.model';
import { Resource } from './resource.model';
import { StringVariable } from './stringVariable.model';

/**
 * The PDF-printable version of an entity, that contains variables and inner contextes as defined by either a
 * `PDFTemplateBlueprint` or `PDFTemplateSectionBlueprint`.
 */
export abstract class PDFEntity extends Resource {
  /**
   * Either one of the two:
   *  - '@variableXYZ', representing an attribute of the entity.
   *  - '_innerContext' | '__innerCustomContext', to represent a child object that will contain itself variables
   *    and inner contextes.
   */
  [index: string]: any;
}

/**
 * The section of a multi-sections template for PDF printing of entities.
 */
export class PDFTemplateSection extends Resource {
  /**
   * The type of section.
   */
  type: PDFTemplateSectionTypes;
  /**
   * A description to help identify the section in the template.
   */
  description?: string;
  /**
   * Whether to show a border around the section.
   */
  border?: boolean;
  /**
   * The content of the 12 columns of a ROW section.
   * Each element of the array may contain:
   *  - A `PDFTemplateSimpleField` or `PDFTemplateSimpleField`;
   *  - `-`, to indicate that the field in the previous column span over the represented column;
   *  - null, to indicate a blank column.
   */
  columns?: (PDFTemplateSimpleField | PDFTemplateComplexField | string)[];
  /**
   * The title of a HEADER section or INNER_SECTION (or REPATED_INNER_SECTION).
   * It's a Label (markdown) supporting variables substitution (e.g. `Here's **@myVar**`).
   * Note: the var substitution is made on runtime data, based on the section's context.
   */
  title?: Label;
  /**
   * The context to consider for the data of a INNER_SECTION or REPEATED_INNER_SECTION (inception).
   */
  context?: string;
  /**
   * The inner template for a INNER_SECTION or REPEATED_INNER_SECTION (inception).
   */
  innerTemplate?: PDFTemplateSection[];

  load(x: any, languages?: Languages) {
    super.load(x);
    this.type = this.clean(x.type, Number, 0) as PDFTemplateSectionTypes;
    if (x.description) this.description = this.clean(x.description, String);
    if (x.border) this.border = true;
    switch (this.type) {
      case PDFTemplateSectionTypes.ROW:
        this.columns = new Array<PDFTemplateSimpleField | PDFTemplateComplexField | string>();
        for (let k = 0; k < 12; k++) this.columns.push(null);
        if (x.columns)
          for (let i = 0; i < this.columns.length; i++) {
            if (!x.columns[i]) this.columns[i] = null;
            else if (x.columns[i] === '-') this.columns[i] = '-';
            else
              this.columns[i] = x.columns[i].code
                ? new PDFTemplateSimpleField(x.columns[i], languages)
                : new PDFTemplateComplexField(x.columns[i], languages);
          }
        break;
      case PDFTemplateSectionTypes.HEADER:
        this.title = new Label(x.title, languages);
        break;
      case PDFTemplateSectionTypes.INNER_SECTION:
      case PDFTemplateSectionTypes.REPEATED_INNER_SECTION:
        if (x.title) this.title = new Label(x.title, languages);
        else {
          // init the title equal to the section description
          this.title = new Label(null, languages);
          this.title[languages.default] = this.description;
        }
        this.context = this.clean(x.context, String);
        this.innerTemplate = this.cleanArray(x.innerTemplate, t => new PDFTemplateSection(t, languages));
        break;
    }
  }

  validate(languages: Languages, variables?: (LabelVariable | StringVariable)[]): string[] {
    const e = super.validate();
    const ST = PDFTemplateSectionTypes;
    if (!(this.type in ST)) e.push('type');
    if (this.type === ST.ROW) {
      this.columns.forEach((content, i) => {
        if (this.doesColumnContainAField(i)) {
          const field = content as PDFTemplateSimpleField | PDFTemplateComplexField;
          if (field.isComplex()) {
            const complexField: PDFTemplateComplexField = field as PDFTemplateComplexField;
            if (complexField.content.validate(languages).length) e.push(`columns[${i}]`);
          } else {
            const simpleField: PDFTemplateSimpleField = field as PDFTemplateSimpleField;
            if (variables && !(variables || []).some(v => v.code === simpleField.code)) e.push(`columns[${i}]`);
          }
        }
      });
    }
    if (this.type === ST.HEADER && this.title.validate(languages).length) e.push('title');
    if (this.isEither(ST.INNER_SECTION, ST.REPEATED_INNER_SECTION)) {
      if (!this.context) e.push('context');
      this.innerTemplate.forEach((s, i) => {
        if (s.validate(languages).length) e.push(`innerTemplate[${i}]`);
      });
    }
    return e;
  }

  /**
   * Check whether the section is among one of the types selected.
   */
  isEither(...types: PDFTemplateSectionTypes[]): boolean {
    return types.some(t => this.type === t);
  }

  /**
   * Whether the column identified by the index is empty or not.
   */
  isColumnEmpty(indexInColumns: number): boolean {
    // skip in case the section isn't of type ROW
    if (this.type !== PDFTemplateSectionTypes.ROW) return false;
    else return !this.columns[indexInColumns];
  }

  /**
   * Whether the column identified by the index contains or not a field.
   * It returns false in case the section isn't of type ROW.
   */
  doesColumnContainAField(indexInColumns: number): boolean {
    // skip in case the section isn't of type ROW
    if (this.type !== PDFTemplateSectionTypes.ROW) return false;
    // if '-', it means that in the previous columns there's a field spanning over the current column
    return this.columns[indexInColumns] && this.columns[indexInColumns] !== '-';
  }
  /**
   * Given the index of a column containing a field, return on how many columns the field spans.
   */
  getColumnFieldSize(indexInColumns: number): number {
    let size = 1;
    if (this.doesColumnContainAField(indexInColumns))
      while (++indexInColumns < 12 && this.columns[indexInColumns] === '-') size++;
    return size;
  }
  /**
   * Remove a field from the columns that it occupied before.
   */
  removeFieldFromOccupiedColumns(colIndex: number) {
    // skip if the column doesn't contain a field
    if (!this.doesColumnContainAField(colIndex)) return;
    // remove it from the starting column
    this.columns[colIndex] = null;
    // remove it from all the other columns on which it span
    this.columns.slice(colIndex + 1).some((c, index) => {
      if (c === '-') {
        this.columns[colIndex + 1 + index] = null;
        return false;
      } else return true;
    });
  }
}

/**
 * The type of sections for a PDF template.
 */
export enum PDFTemplateSectionTypes {
  PAGE_BREAK = 0,
  BLANK_ROW,
  ROW,
  HEADER,
  INNER_SECTION,
  REPEATED_INNER_SECTION
}

/**
 * A simple field, with a direct reference to a variable, depending on the current section's context.
 */
export class PDFTemplateSimpleField extends Resource {
  /**
   * The field's label.
   */
  label: Label;
  /**
   * The direct reference to a variable to substitute (e.g. `@myVar`).
   * Note: the variable substitution is made on runtime data, based on the section's context.
   */
  code: string;

  load(x: any, languages: Languages) {
    super.load(x);
    this.label = new Label(x.label, languages);
    this.code = this.clean(x.code, String);
  }

  /**
   * Quickly recognize the nature of the field (simple/complex).
   */
  isComplex(): boolean {
    return false;
  }
}
/**
 * A complex field, with a content depending on the current section's context.
 */
export class PDFTemplateComplexField extends Resource {
  /**
   * A Label (markdown support) that may contain variables to subsitute (e.g. `Here's **@myVar**`).
   * Note: the variable substitution is made on runtime data, based on the section's context.
   */
  content: Label;

  load(x: any, languages: Languages) {
    super.load(x);
    this.content = new Label(x.content, languages);
  }

  /**
   * Quickly recognize the nature of the field (simple/complex).
   */
  isComplex(): boolean {
    return true;
  }
}

/**
 * It represents the blueprint that defines how the PDF template is structured, based on the project's data.
 */
export interface PDFTemplateBlueprint {
  /**
   * A description to identify the templates of this blueprint.
   */
  description: string;
  /**
   * The variables available in templates of this blueprint.
   */
  variables: LabelVariable[];
  /**
   * The blueprints of inner sections.
   */
  innerBlueprints?: PDFTemplateSectionBlueprint[];
}
/**
 * It represent the blueprint of an inner section of a PDF template blueprint.
 */
export interface PDFTemplateSectionBlueprint extends PDFTemplateBlueprint {
  /**
   * An icon to visually recognize this blueprint's sections.
   */
  icon: string;
  /**
   * The context to access data of this blueprint's sections.
   */
  context: string;
  /**
   * The type of this blueprint's sections.
   */
  type: PDFTemplateSectionTypes;
}
