/**
 * API GATEWAY
 */

import Request = require('request');

export class APIGateway {
  constructor() {}

  /**
   * Request wrapper to enable API requests with simplified parameters
   * @param {string} method enum: HTTP methods
   * @param {any} options optional; typical requests options (e.g. url, body, headers, etc.)
   * @param {number} delay optional; if set, the request is executed after a certain delay (in ms).
   *  Useful to avoid overwhelming the back-end when the execution isn't time pressured.
   * @return {Promise<any>}
   */
  public request(method: string, options?: any, delay?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      delay = delay || 1; // ms
      setTimeout(() => {
        // prepare the parameters and the options
        method = method.toLowerCase();
        if(!options.dontParseBody) options.body = options.body || null;
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
}