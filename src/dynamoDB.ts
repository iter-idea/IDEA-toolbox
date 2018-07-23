/**
 * DYNAMO DB
 */

import AWS = require('aws-sdk');
import UUIDV4 = require('uuid/v4');

import { Utils } from './utils';

export class DynamoDB {
  protected dynamo: any; // the instance of DynamoDB

  constructor(protected project: string, protected tables: any, protected utils: Utils) {
    this.dynamo = new AWS.DynamoDB.DocumentClient();
    // add support tables
    this.tables.IUID = 'idea_IUID';
    this.tables.atomicCounters = 'idea_atomicCounters';
  }

  /**
   * Returns an IUID: IDEA's Unique IDentifier, which is an id unique through all IDEA's projects.
   * Note: there's no need of an authorization check for extrernal uses: the permissions depend
   * from the context in which it's executed.
   * @return {Promise<string>} the IUID
   */
  public IUID(): Promise<string> {
    return new Promise((resolve, reject) => {
      let MAX_ATTEMPTS = 3;
      this.iuidHelper(0, MAX_ATTEMPTS, resolve, reject);
    });
  }
  /**
   * @private helper
   */
  protected iuidHelper(attempt: number, maxAttempts: number, resolve: any, reject: any): void {
    if(attempt > maxAttempts) reject();
    else {
      let id = UUIDV4();
      this.put({ 
        TableName: 'idea_IUID', 
        Item: { project: this.project, id: id },
        ConditionExpression: 'NOT (#p = :project AND #id = :id)',
        ExpressionAttributeNames: { '#p': 'project', '#id': 'id' },
        ExpressionAttributeValues: { ':project': this.project, ':id': id }
      })
      .then(() => resolve(`${this.project}_${id}`))
      .catch(() => // ID exists, try again
        this.iuidHelper(attempt+1, maxAttempts, resolve, reject)); 
    }
  }

  /**
   * Manage atomic counters (atomic autoincrement values) in IDEA's projects.
   * They key of an atomic counter should be composed as the following: `DynamoDBTableName_uniqueKey`.
   * @param {string} key the key of the counter
   * @return {Promise<number>}
   */
  public getAtomicCounterByKey(key: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.utils.logger('GET ATOMIC COUNTER', null, key);
      this.update({
        TableName: this.tables.atomicCounter, Key: { key: key },
        UpdateExpression: 'ADD atomicCounter :increment',
        ExpressionAttributeValues: { ':increment': 1 },
        ReturnValues: 'UPDATED_NEW'
      })
      .then((data: any) => resolve(data.Attributes.atomicCounter))
      .catch(err => reject(err));
    });
  }

  /**
   * Get an item of a DynamoDB table.
   * @param {any} params the params to apply to DynamoDB's function
   * @return {Promise<any>}
   */
  public get(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dynamo.get(params, (err: Error, data: any) => {
        this.utils.logger(`GET ${params.IndexName ? `${params.TableName} (${params.IndexName})`
          : params.TableName}`, err, data);
        if(err || !data.Item) reject(err);
        else resolve(data.Item);
      });
    });
  }

  /**
   * Put an item in a DynamoDB table.
   * @param {any} params the params to apply to DynamoDB's function
   * @return {Promise<any>}
   */
  public put(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dynamo.put(params, (err: Error, data: any) => {
        this.utils.logger(`PUT ${params.TableName}`, err, params.Item);
        if(err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * Update an item of a DynamoDB table.
   * @param {any} params the params to apply to DynamoDB's function
   * @return {Promise<any>}
   */
  public update(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dynamo.update(params, (err: Error, data: any) => {
        this.utils.logger(`UPDATE ${params.TableName}`, err, data);
        if(err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * Delete an item of a DynamoDB table.
   * @param {any} params The params to apply to DynamoDB's function
   * @return {Promise<any>}
   */
  public delete(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dynamo.delete(params, (err: Error, data: any) => {
        this.utils.logger(`DELETE ${params.TableName}`, err, params.Key);
        if(err) reject(err);
        else resolve(data);
      });
    });
  }

  /**
   * Get group of items based on their keys from DynamoDb table, 
   * avoiding the limits of DynamoDB's BatchGetItem.
   * @param {string} table DynamoDB table on which to operate
   * @param {Array<any>} keys the keys of items to get
   * @param {boolean} ignoreErr optional; if true, ignore the errors and continue the bulk op.
   * @return {Promise<Array<any>>}
   */
  public batchGet(table: string, keys: Array<any>, ignoreErr?:boolean): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      if(keys.length == 0) {
        this.utils.logger(`BATCH GET ${table}`, null, `No elements to get`);
        resolve();
      } else this.batchGetHelper(table, keys, Boolean(ignoreErr), 0, 100, resolve, reject);
    });
  }
  /**
   * @private helper
   */
  protected batchGetHelper(
    t: string, keys: Array<any>, iErr: boolean, curr: number, size: number, 
    resolve: any, reject: any
  ): void {
    // prepare the structure for the bulk operation
    let batch: any = { RequestItems: {} };
    batch.RequestItems[t] = keys
      .slice(curr, curr+size)
      .map(k => { return { Keys: k } });
    // execute the bulk operation
    this.dynamo.batchGetItem(batch, (err: Error) => {
      this.utils.logger(`BATCH GET ${t}`, err, `${curr} of ${keys.length}`);
      if(err && !iErr) reject(err);
      // if there are still chunks to manage, go on recursively
      else if(curr+size < keys.length)
        this.batchGetHelper(t, keys, iErr, curr+size, size, resolve, reject);
      // no more chunks to manage: we're done
      else resolve();
    });
  }
    
  /**
   * Put an array of items in a DynamoDb table, avoiding the limits of DynamoDB's BatchWriteItem.
   * @param {string} table DynamoDB table on which to operate
   * @param {Array<any>} items the items to put
   * @param {boolean} ignoreErr optional; if true, ignore the errors and continue the bulk op.
   * @return {Promise<any>}
   */
  public batchPut(table: string, items: Array<any>, ignoreErr?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      if(items.length == 0) {
        this.utils.logger(`BATCH WRITE ${table}`, null, `No elements to write`);
        resolve();
      } else this.batchWriteHelper(table, items, true, Boolean(ignoreErr), 0, 25, resolve, reject);
    });
  }
  /**
   * Delete an array of items from a DynamoDb table, 
   * avoiding the limits of DynamoDB's BatchWriteItem.
   * @param {string} table DynamoDB table on which to operate
   * @param {Array<any>} keys the keys of items to delete
   * @param {boolean} ignoreErr optional; if true, ignore the errors and continue the bulk op.
   * @return {Promise<any>}
   */
  protected batchDelete(table: string, keys: Array<any>, ignoreErr?: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      if(keys.length == 0) {
        this.utils.logger(`BATCH WRITE ${table}`, null, `No elements to write`);
        resolve();
      } else this.batchWriteHelper(table, keys, false, Boolean(ignoreErr), 0, 25, resolve, reject);
    });
  }
  /**
   * @private helper
   */
  protected batchWriteHelper(
    t: string, items: Array<any>, iErr: boolean, isPut: boolean, 
    curr: number, size: number, resolve: any, reject: any
  ): void {
    // prepare the structure for the bulk operation
    let batch: any = { RequestItems: {} };
    if(isPut) {
      batch.RequestItems[t] = items
      .slice(curr, curr+size)
      .map(i => { return { PutRequest: { Item: i } } });
    } else { // isDelete
      batch.RequestItems[t] = items
      .slice(curr, curr+size)
      .map(k => { return { DeleteRequest: { Key: k } } });
    }
    // execute the bulk operation
    this.dynamo.batchWriteItem(batch, (err: Error) => {
      this.utils.logger(`BATCH WRITE ${t}`, err, `${curr} of ${items.length}`);
      if(err && !iErr) reject(err);
      // if there are still chunks to manage, go on recursively
      else if(curr+size < items.length)
        this.batchWriteHelper(t, items, iErr, isPut, curr+size, size, resolve, reject);
      // no more chunks to manage: we're done
      else resolve();
    });
  }

  /**
   * Query a DynamoDb table, avoiding the limits of DynamoDB's Query.
   * @param {any} params the params to apply to DynamoDB's function
   * @return {Promise<Array<any>>}
   */
  public query(params: any): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.queryScanHelper(params, [], true, resolve, reject);
    });
  }
  /**
   * Scan a DynamoDb table, avoiding the limits of DynamoDB's Query.
   * @param {any} params the params to apply to DynamoDB's function
   * @return {Promise<Array<any>>}
   */
  public scan(params: any): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      this.queryScanHelper(params, [], false, resolve, reject);
    });
  }
  /**
   * @private helper
   */
  protected queryScanHelper(
    params: any, items: Array<any>, isQuery: boolean, resolve: any, reject: any
  ): void {
    let f = isQuery ? 'query' : 'scan';
    this.dynamo[f](params, (err: Error, data: any) => {
      if(err || !data || !data.Items) {
        this.utils.logger(`SCAN ${params.TableName}`, err, data);
        return reject(err);
      }
      items = items.concat(data.Items);
      if(data.LastEvaluatedKey) {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        this.queryScanHelper(params, items, false, resolve, reject);
      } else {
        this.utils.logger(`SCAN ${params.TableName}`, null, items.length.toString());
        resolve(items);
      }
    });
  }
}
