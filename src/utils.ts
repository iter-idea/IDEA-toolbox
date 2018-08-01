/**
 * Utilities (static) functions, to support IDEA's projects.
 */

/**
 * Convert an ISODate string to the Italian format.
 * @param {string} ds new Date().toISOString();
 * @returns {string} cleaned date
 */
export function ISODateToItalianFormat(ds: string): string {
  return `${ds.slice(8, 10)}/${ds.slice(5, 7)}/${ds.slice(0, 4)}`;
}

/**
 * Convert a date to the specified locale format.
 * @param {Date} date the date to convert
 * @param {string} lang two-letter code (e.g. 'en' or 'it')
 * @param {boolean} short if true, get the short version of the date
 * @param {boolean} noYear if true, don't concat the year
 * @returns {string} the date converted
 */
export function dateToLocale(date: Date, lang: string, short?: boolean, noYear?: boolean): string {
  let dayName = date.toLocaleDateString(lang, { weekday: short ? 'short' : 'long' });
  dayName = dayName.slice(0, 1).toUpperCase().concat(dayName.slice(1));
  let day = date.toLocaleDateString(lang, { day: 'numeric' });
  let month = date.toLocaleDateString(lang, { month: short ? 'short' : 'long' });
  month = month.slice(0, 1).toUpperCase().concat(month.slice(1));
  let year = date.toLocaleDateString(lang, { year: 'numeric' });
  return `${dayName} ${day} ${month} ${noYear ? '' : year}`;
}

/**
 * Clean a string to use it within filenames and so.
 * @param {string} str the string to clean
 * @param {string} separator optional, separator char
 * @returns {string} cleaned string
 */
export function cleanStr(str: string, separator?: string): string {
  return (str || '').toLowerCase().replace(/[^a-zA-Z0-9]+/g, separator || '');
}

/**
 * Join two arrays by a common column, selecting which data to extract.
 * @param {Array<any>} mainTable the main array
 * @param {Array<any>} lookupTable the lookup array
 * @param {string} mainKey mainTable's column for the join condition
 * @param {string} lookupKey lookupTable's column for the join condition
 * @param {(attrMainTable, attrLookupTable) => Array<any>} selectFunction defines which
 * attributes we want to retain in the joined array; null values generated by the
 * function are ignored
 * @returns {Array<any>} the joined array
 */
export function joinArraysOnKeys(
  mainTable: Array<any>, lookupTable: Array<any>, mainKey: string, lookupKey: string, selectFunction: (attrMainTable: string, attrLookupTable: string) => Array<any>
): Array<any> {
  let l = lookupTable.length;
  let m = mainTable.length;
  let lookupIndex = [];
  let output = [];
  for(let i = 0; i < l; i++) { // loop through l items
    let row = lookupTable[i];
    lookupIndex[row[lookupKey]] = row; // create an index for lookup table
  }
  for(let j = 0; j < m; j++) { // loop through m items
    let y = mainTable[j];
    let x = lookupIndex[y[mainKey]]; // get corresponding row from lookupTable
    let o = selectFunction(y, x); // select only the columns you need
    if(o) output.push(o); // null values returned by the select function are ignored
  }
  return output;
}

/**
 * Check if a field (/variable) is empty, based on its type.
 * If the type isn't passed as a parameter, it will be auto-detected.
 * @param {any} field the field to check
 * @param {string} type optional; set to force a type check; enum: string, number, date, boolean
 * @returns {boolean} return if the field is empty or not
 */
export function isEmpty(field: any, type?: string): boolean {
  if(!field) return true;         // null, undefined
  if(!type) type = typeof field;  // try to auto-detect
  if(!type) return true;          // undefined
  // check emptiness based on the type
  switch(type) {
    case 'string': return field.trim().length <= 0;
    case 'number': return field <= 0;
    case 'boolean': return !Boolean(field);
    case 'date':
    case 'object': {
      if(field instanceof Date || type == 'date') {
        let d = new Date(field);
        return Object.prototype.toString.call(d) !== '[object Date]'
      } else if(field instanceof Array)
        return field.filter((i: any) => !isEmpty(i)).length <= 0;
      else return true;
    }
    default: return true;
  }
}

/**
 * Add a formatted log in the console.
 * @param {string} context context in which the content apply
 * @param {Error} err error
 * @param {string} content the content to log
 * @param {boolean} important optional; if true, highlight the line in CloudWatch
 */
export function logger(context: string, err: Error, content: string, important?: boolean): void {
  if(err) console.error('[ERROR]', context, '≫', err, content);
  else if(important) console.log(`[${context}]`, content);
  else console.log('.....', context, '≫', content); // to give less importance to debug info
}

/**
 * Request wrapper to enable API requests to AWS API Gatewat with simplified parameters.
 * @param {string} method enum: HTTP methods
 * @param {any} options typical requests options (e.g. url, body, headers, etc.)
 * @param {number} delay if set, the request is executed after a certain delay (in ms).
 * Useful to avoid overwhelming the back-end when the execution isn't time pressured.
 * @return {Promise<any>}
 */
export function requestAPI(method: string, options?: any, delay?: number): Promise<any> {
  return new Promise((resolve, reject) => {
    delay = delay || 1; // ms
    setTimeout(() => {
      // prepare the parameters and the options
      method = method.toLowerCase();
      if(options.dontParseBody) options.body = options.body || null;
      else options.body = options.body ? JSON.stringify(options.body) : null;
      options.url = encodeURI(options.url);
      // execute the request and reject or resolve the promise
      (<any>Request)[method](options, (err: Error, res: any) => {
        if(err) reject(err)
        else if(res.statusCode !== 200) reject(`[${res.statusCode}] ${res.body}`);
        else {
          try { resolve(JSON.parse(res.body)); }
          catch(e) { return resolve(res.body); }
        }
      });
    }, delay);
  });
}