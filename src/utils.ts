import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isURL from 'validator/lib/isURL';
import isFQDN from 'validator/lib/isFQDN';
import isDate from 'validator/lib/isDate';
import { marked } from 'marked';

import { markdown } from './markdown';
import { epochISODateString } from './epoch';

//
// Utilities (static) functions, to support IDEA's projects.
//

/**
 * Parse a date in the format `YYYY-MM-DD`.
 */
export const toISODate = (date: Date | string | number): epochISODateString => {
  if (!date) return null;
  const dateResistantToTimeZones = new Date(date);
  dateResistantToTimeZones.setHours(12, 0, 0, 0);
  return dateResistantToTimeZones.toISOString().slice(0, 10);
};

/**
 * Clean a string to use it within filenames and so.
 * @param str the string to clean
 * @param separator optional, separator char
 * @returns cleaned string
 */
export const cleanStr = (str: string, separator?: string): string =>
  (str ?? '').toLowerCase().replace(/[^a-zA-Z0-9]+/g, separator ?? '');

/**
 * Join two arrays by a common column, selecting which data to extract.
 * @param mainTable the main array
 * @param lookupTable the lookup array
 * @param mainKey mainTable's column for the join condition
 * @param lookupKey lookupTable's column for the join condition
 * @param selectFunction defines which
 * attributes we want to retain in the joined array; null values generated by the
 * function are ignored
 * @returns the joined array
 */
export const joinArraysOnKeys = (
  mainTable: any[],
  lookupTable: any[],
  mainKey: string,
  lookupKey: string,
  selectFunction: (attrMainTable: string, attrLookupTable: string) => any[]
): any[] => {
  const lookupIndex = [];
  const output = [];
  for (const row of lookupTable) lookupIndex[row[lookupKey]] = row;
  for (const row of mainTable) {
    const lookupTableRow = lookupIndex[row[mainKey]];
    const outputElement = selectFunction(row, lookupTableRow);
    if (outputElement) output.push(outputElement);
  }
  return output;
};

/**
 * Check if a field (/variable) is empty or invalid, based on its type.
 * If the type isn't passed as a parameter, it will be auto-detected.
 * @param field the field to check
 * @param fieldType set to force a type check
 * @returns return if the field is empty/invalid or not
 */
export const isEmpty = (field: any, fieldType?: isEmptyFieldTypes): boolean => {
  if (field === null || field === undefined) return true;
  const type = fieldType ?? typeof field;
  if (!type) return true;
  switch (type) {
    case 'string':
      return !field.trim().length;
    case 'number':
      return field === 0;
    case 'positiveNumber':
      return field <= 0;
    case 'boolean':
      return !field;
    case 'object':
      if (field instanceof Array) return field.filter(i => i).length <= 0;
      else if (field instanceof Set) return field.size <= 0;
      else if (field instanceof Date) return !isDate(field.toISOString().slice(0, 10));
      else return Object.keys(field).length <= 0;
    case 'date':
      return !isDate(new Date(field).toISOString().slice(0, 10));
    case 'email':
      return !isEmail(field);
    case 'phone':
      return !isMobilePhone(field, 'any');
    case 'url':
      return !isURL(field);
    case 'domain':
      return !isFQDN(field, { require_tld: false });
    default:
      return true;
  }
};
export type isEmptyFieldTypes =
  | 'string'
  | 'number'
  | 'positiveNumber'
  | 'boolean'
  | 'object'
  | 'date'
  | 'email'
  | 'phone'
  | 'url'
  | 'domain';

/**
 * Convert a markdown string to HTML.
 */
export const mdToHtml = (mdString: markdown | string): string =>
  !mdString ? '' : (marked(mdString, { gfm: true, breaks: true }) as string);

//
// DEPRECATED
//

/**
 * @deprecated Get an array to iterate containing the keys of a string enum.
 */
export const loopStringEnumKeys = (theEnum: any): string[] => Object.keys(theEnum);
/**
 * @deprecated Get an array to iterate containing the values of a string enum.
 */
export const loopStringEnumValues = (theEnum: any): string[] => Object.keys(theEnum).map(key => theEnum[key]);
/**
 * @deprecated Get an array to iterate containing the keys of a numeric enum.
 */
export const getStringEnumKeyByValue = (theEnum: any, value: string): string => {
  const el = Object.keys(theEnum)
    .map(key => ({ value: theEnum[key], key }))
    .find(x => x.value === value);
  return el ? el.key : null;
};
/**
 * @deprecated Get an array to iterate containing the keys of a numeric enum.
 */
export const loopNumericEnumKeys = (theEnum: any): number[] =>
  Object.keys(theEnum)
    .filter(key => !isNaN(Number(key)))
    .map(c => Number(c));
/**
 * @deprecated Get an array to iterate containing the values of a numeric enum.
 */
export const loopNumericEnumValues = (theEnum: any): string[] =>
  Object.keys(theEnum)
    .filter(key => !isNaN(Number(theEnum[key])))
    .map(c => String(c));
