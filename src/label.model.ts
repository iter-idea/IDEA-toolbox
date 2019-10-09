/**
 * Each of the attributes contains the translation in that language of the Label.
 *
 * Example:
 * ```
 * name.it: 'ciao';
 * name.en: 'hello';
 * ```
 */
export class Label {
  /**
   * It supports only _key -> values_ of type string, representing translations in different languages.
   */
  [key: string]: string | any;

  constructor(availableLanguages?: Array<string>, x?: any) {
    if (x) availableLanguages.forEach(l => (this[l] = x[l] ? String(x[l]) : null));
    else availableLanguages.forEach(l => (this[l] = null));
  }

  public validate(defaultLanguage: string): Array<string> {
    if (!this[defaultLanguage]) return [defaultLanguage];
    else return [];
  }
}
