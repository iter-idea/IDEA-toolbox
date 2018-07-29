import Fs = require('fs')

/**
 * Utilities (generic) functions, to support IDEA's projects. 
 */
export class Utils {
  /**
   * Initialize a new Utils helper object.
   */
  constructor() {}

  /**
   * Convert an ISODate string to the Italian format.
   * @param {string} ds new Date().toISOString();
   * @return {string} cleaned date
   */
  public ISODateToItalianFormat(ds: string): string {
    return `${ds.slice(8, 10)}/${ds.slice(5, 7)}/${ds.slice(0, 4)}`;
  }

  /**
   * Clean a string to use it within filenames and so.
   * @param {string} str the string to clean
   * @param {string} separator optional, separator char
   * @return cleaned string
   */
  public cleanStr(str: string, separator?: string): string {
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
   * @return {Array<any>} the joined array
   */
  public joinArraysOnKeys(
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
   * @return {boolean} return if the field is empty or not
   */
  public isEmpty(field: any, type?: string): boolean {
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
        } else if(field instanceof Array) return field.length <= 0;
        else return true;
      }
      default: return true;
    }
  }

  /**
   * Save the content of an object to the desired folder (as a log file); it works sync.
   * @param {string} name name of the object (== filename)
   * @param {any} obj the JSON object
   * @param {string} folder if null, uses the Config.LOGS.FOLDER
   */
  public saveObjToFile(name: string, obj: any, folder: string): void {
    Fs.writeFileSync(`${folder}/${name}.json`, JSON.stringify(obj));
  }

  /**
   * Add a formatted log in the console.
   * @param {string} context context in which the content apply
   * @param {Error} err error
   * @param {string} content the content to log
   * @param {boolean} important optional; if true, highlight the line in CloudWatch
   */
  public logger(context: string, err: Error, content: string, important?: boolean): void {
    if(err) console.error('[ERROR]', context, '≫', err, content);
    else if(important) console.log(`[${context}]`, content);
    else console.log('.....', context, '≫', content); // to give less importance to debug info
  }
}