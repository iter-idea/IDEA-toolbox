/**
 * A variable to substitute at runtime while parsing strings.
 */
export interface StringVariable {
  /**
   * The code of the variable (the string that will be substituted).
   */
  code: string;
  /**
   * The description of the variable, i.e. the explanation of the content that will be substituted to this variable.
   */
  description: string;
}
