import Validator = require('validator');

/**
 * Utilities (static) functions, to support IDEA's projects.
 */

/**
 * Convert an ISODate string to the Italian format.
 * @param ds new Date().toISOString();
 * @returns cleaned date
 */
export function ISODateToItalianFormat(ds: string): string {
  return `${ds.slice(8, 10)}/${ds.slice(5, 7)}/${ds.slice(0, 4)}`;
}

/**
 * Convert a date to the specified locale format.
 * @param date the date to convert
 * @param lang two-letter code (e.g. 'en' or 'it')
 * @param short if true, get the short version of the date
 * @param noYear if true, don't concat the year
 * @returns the date converted
 */
export function dateToLocale(date: Date, lang: string, short?: boolean, noYear?: boolean): string {
  let dayName = date.toLocaleDateString(lang, { weekday: short ? 'short' : 'long' });
  dayName = dayName
    .slice(0, 1)
    .toUpperCase()
    .concat(dayName.slice(1));
  const day = date.toLocaleDateString(lang, { day: 'numeric' });
  let month = date.toLocaleDateString(lang, { month: short ? 'short' : 'long' });
  month = month
    .slice(0, 1)
    .toUpperCase()
    .concat(month.slice(1));
  const year = date.toLocaleDateString(lang, { year: 'numeric' });
  return `${dayName} ${day} ${month} ${noYear ? '' : year}`;
}

/**
 * Clean a string to use it within filenames and so.
 * @param str the string to clean
 * @param separator optional, separator char
 * @returns cleaned string
 */
export function cleanStr(str: string, separator?: string): string {
  return (str || '').toLowerCase().replace(/[^a-zA-Z0-9]+/g, separator || '');
}

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
export function joinArraysOnKeys(
  mainTable: Array<any>,
  lookupTable: Array<any>,
  mainKey: string,
  lookupKey: string,
  selectFunction: (attrMainTable: string, attrLookupTable: string) => Array<any>
): Array<any> {
  const l = lookupTable.length;
  const m = mainTable.length;
  const lookupIndex = [];
  const output = [];
  for (let i = 0; i < l; i++) {
    // loop through l items
    const row = lookupTable[i];
    lookupIndex[row[lookupKey]] = row; // create an index for lookup table
  }
  for (let j = 0; j < m; j++) {
    // loop through m items
    const y = mainTable[j];
    const x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
    const o = selectFunction(y, x); // select only the columns you need
    if (o) output.push(o); // null values returned by the select function are ignored
  }
  return output;
}

/**
 * Check if a field (/variable) is empty, based on its type.
 * If the type isn't passed as a parameter, it will be auto-detected.
 * @param field the field to check
 * @param type optional; set to force a type check; enum: string, number, date, boolean, email, phone
 * @returns return if the field is empty or not
 */
export function isEmpty(field: any, type?: string): boolean {
  if (!field) return true; // null, undefined
  if (!type) type = typeof field; // try to auto-detect
  if (!type) return true; // undefined
  // check emptiness based on the type
  switch (type) {
    case 'string':
      return field.trim().length <= 0;
    case 'number':
      return field <= 0;
    case 'boolean':
      return !Boolean(field);
    case 'date':
    case 'object': {
      if (field instanceof Date || type === 'date') {
        const d = new Date(field);
        return !(d instanceof Date && !isNaN(d.valueOf()));
      } else if (field instanceof Array) return field.filter((i: any) => i).length <= 0;
      else return true;
    }
    case 'email':
      return !Validator.isEmail(field);
    case 'phone':
      return !Validator.isMobilePhone(field, 'any');
    default:
      return true;
  }
}

/**
 * Add a formatted log in the console.
 * @param context context in which the content apply
 * @param err error
 * @param content the content to log
 * @param important optional; if true, highlight the line in CloudWatch
 */
export function logger(context: string, err: Error, content: string, important?: boolean) {
  if (err) console.error('[ERROR]', context, '≫', err, content);
  else if (important) console.log(`[${context}]`, content);
  else console.log('.....', context, '≫', content); // to give less importance to debug info
}
