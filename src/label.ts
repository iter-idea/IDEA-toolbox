/**
 * Each of the attributes contains the translation in that language of the label.
 *
 * Example:
 *    name.it: 'ciao';
 *    name.en: 'hello;
 *
 * Note: the interface attributes match the available languages.
 */
export interface Label {
  [key: string]: string;
  it?: string;
  en?: string;
}
