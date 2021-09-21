import { Resource } from './resource.model';

/**
 * A class to inherit for specifying the format of an Excel file's rows.
 */
export class ExcelRow extends Resource {
  /**
   * The row number in the Excel file of origin.
   */
  __rowNum__: number;

  load(x: any) {
    super.load(x);
    this.__rowNum__ = this.clean(x.__rowNum__, Number);
  }

  /**
   * Sample data to show how the content of the Excel file should be structured.
   * To be updated accordingly in the child class.
   */
  static getTemplateExample(): ExcelRow[] {
    return [{ __rowNum__: 1 }, { __rowNum__: 2 }, { __rowNum__: 3 }].map(x => new ExcelRow(x));
  }
}
