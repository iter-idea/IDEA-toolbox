import { Languages } from './languages.model';

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

  constructor(x?: any, languages?: Languages) {
    this.load(x, languages);
  }

  public load(x?: any, languages?: Languages) {
    if (x) languages.available.forEach(l => (this[l] = x[l] ? String(x[l]) : null));
    else languages.available.forEach(l => (this[l] = null));
  }

  public validate(languages: Languages): Array<string> {
    if (!this[languages.default]) return [languages.default];
    else return [];
  }

  /**
   * Translate the label in the desired language; in case there's no translation, get the default one.
   */
  public translate(language: string, languages: Languages) {
    return this[language] || this[languages.default];
  }
}
