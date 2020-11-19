import { Label } from './label.model';

/**
 * A variable to substitute at runtime.
 */
export interface LabelVariable {
  /**
   * The code of the variable (the string that will be substituted).
   */
  code: string;
  /**
   * The label of the variable, i.e. the explanation of the content that will be substituted to this variable.
   */
  label: Label;
}
