'use strict';

const Fs = require('fs');
const AWS = require('aws-sdk');
  const S3 = new AWS.S3({ apiVersion: '2006-03-01' });
  const SNS = new AWS.SNS({ apiVersion: '2010-03-31', region: process.env['SNS_PUSH_REGION'] });
const UUIDV4 = require('uuid/v4');
const Nodemailer = require('nodemailer');
const Request = require('request');

const SES_DEFAULT_REGION = process.env['SES_DEFAULT_REGION'];
const SES_DEFAULT_SOURCE = process.env['SES_DEFAULT_SOURCE'];
const SES_DEFAULT_SOURCE_NAME = process.env['SES_DEFAULT_SOURCE_NAME'];
const SES_DEFAULT_SOURCE_ARN = process.env['SES_DEFAULT_SOURCE_ARN'];

const COGNITO_USER_POOL_ID = process.env['COGNITO_USER_POOL_ID'];

const S3_DEFAULT_DOWNLOAD_BUCKET = 'idea-downloads';
const S3_DEFAULT_DOWNLOAD_BUCKET_PREFIX = 'common';
const S3_DEFAULT_DOWNLOAD_BUCKET_SEC_TO_EXP = 180;

const SNS_PUSH_PLATFORM_ARN_IOS = process.env['SNS_PUSH_PLATFORM_ARN_IOS'];
const SNS_PUSH_PLATFORM_ARN_ANDROID = process.env['SNS_PUSH_PLATFORM_ARN_ANDROID'];

module.exports = {
// DYNAMO
  ES2N, Obj2N, IUID, getAtomicCounterByKey, 
  dynamoGet, dynamoPut, dynamoUpdate, dynamoDelete, 
  dynamoBatchGet, dynamoBatchPut, dynamoBatchDelete,
  dynamoQuery, dynamoScan,
// COGNITO
  cognitoGetUserByClaims, cognitoGetUserByEmail, cognitoGetUserBySub,
// SES
  sesSendEmail,
// S3
  downloadThroughS3Url,
// SNS
  createSNSPushPlatormEndpoint, publishSNSPush,
// API GATEWAY
  requestToAPI, requestDoneAPI,
// CLOUDWATCH
  logger,
// UTILITIES
  ISODateToItalianFormat, cleanStr, joinArraysOnKeys, isEmpty, saveObjToFile
}


///
/// DYNAMO
///

/**
 * Helper to solve the known problem of Amazon DB with empty strings:
 * if the string is empty, return null
 * Ref. https://forums.aws.amazon.com/thread.jspa?threadID=90137
 * @param {string} string string to remap
 * @return {string} cleaned string
 */
function ES2N(string) {
  return (!string || string.length == 0) ? null : string;
}

/**
 * Helper to naively solve the empty string / undefined attributes in Dynamo.
 * Disclaimer: it can be really slow, so use it only when necessary
 * (otherwise prefer the quicker ES2N).
 * @param {any} obj obj to remap
 * @param {number} maxDepth max deepness in which to nest the function.
 * @param {number} currentDepth to skip initial levels, if needed
 * @return {any} cleaned object
 */
function Obj2N(obj, maxDepth, currentDepth) {
  // stop the execution if obj is not an object (if it's a string, works as ES2N)
  if(obj == null || obj == undefined) return null;
  else if(typeof obj == 'string') return ES2N(obj);
  else if(typeof obj != 'object') return obj;
  // go deeper in the object
  if(!maxDepth) maxDepth = 0;
  if(!currentDepth) currentDepth = 0;
  for(var prop in obj) {
    if(obj[prop] == undefined) obj[prop] = null;
    else if(typeof obj[prop] == 'string') obj[prop] = ES2N(obj[prop]);
    else if(typeof obj[prop] == 'object' && Array.isArray(obj[prop]) && currentDepth < maxDepth)
      obj[prop].forEach((el, index, arr) => arr[index] = Obj2N(el, maxDepth, currentDepth+1));
        // a standard forEach won't work with elements different from objects (e.g. strings)
    else if(typeof obj[prop] == 'object' && !Array.isArray(obj[prop]) && currentDepth < maxDepth)
      obj[prop] = Obj2N(obj[prop], maxDepth, currentDepth+1);
  }
  return obj;
}

/**
 * Returns an IUID: IDEA's Unique IDentifier, which is an id unique through all IDEA's projects.
 * Note: there's no need of an authorization check for extrernal uses: the permissions depend
 * from the context in which it's executed.
 * @param {any} dynamo the istance of DynamoDB to use
 * @param {string} project the project to use as domain
 * @return {Promise<string>} promise
 */
function IUID(dynamo, project, attempt, maxAttempts) {
  return new Promise((resolve, reject) => {
    attempt = attempt || 0;
    maxAttempts = maxAttempts || 3;
    if(!project || attempt > maxAttempts) reject();
    else {
      let id = UUIDV4();
      dynamoPut(dynamo, { 
        TableName: 'idea_IUID', 
        Item: { project: project, id: id },
        ConditionExpression: 'NOT (project=:project AND id=:id)',
        ExpressionAttributeValues: { ':project': project, ':id': id }
      })
      .then(() => resolve(project+'_'+id))
      .catch(() => IUID(dynamo, project, attempt+1, maxAttempts)); // ID exists, try again
    }
  });
}

/**
 * Manage atomic counters (atomic autoincrement values) in IDEA's projects.
 * They key of an atomic counter should be composed as the following: `DynamoDBTableName_uniqueKey`.
 * @param {any} dynamo the istance of DynamoDB to use
 * @param {string} key the key of the counter
 * @return {Promise<number>}
 */
function getAtomicCounterByKey(dynamo, key) {
  return new Promise((resolve, reject) => {
    logger('GET ATOMIC COUNTER', null, key);
    dynamoUpdate(dynamo, {
      TableName: 'idea_atomicCounters', Key: { key: key },
      UpdateExpression: 'ADD atomicCounter :increment',
      ExpressionAttributeValues: { ':increment': 1 },
      ReturnValues: 'UPDATED_NEW'
    })
    .then(() => resolve(data.Attributes.atomicCounter))
    .catch(err => reject(err));
  });
}

/**
 * Get an item of a DynamoDB table.
 * @param {any} dynamo The istance of DynamoDB to use
 * @param {any} params The params to apply to DynamoDB's function
 * @return {Promise}
 */
function dynamoGet(dynamo, params) {
  return new Promise((resolve, reject) => {
    dynamo.get(params, (err, data) => {
      logger(`GET ${params.IndexName ? `${params.TableName} (${params.IndexName})`
        : params.TableName}`, err, data);
      if(err || !data.Item) reject(err);
      else resolve(data.Item);
    });
  });
}

/**
 * Put an item in a DynamoDB table.
 * @param {any} dynamo The istance of DynamoDB to use
 * @param {any} params The params to apply to DynamoDB's function
 * @return {Promise}
 */
function dynamoPut(dynamo, params) {
  return new Promise((resolve, reject) => {
    dynamo.put(params, (err, data) => {
      logger(`PUT ${params.TableName}`, err, params.Item);
      if(err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * Update an item of a DynamoDB table.
 * @param {any} dynamo The istance of DynamoDB to use
 * @param {any} params The params to apply to DynamoDB's function
 * @return {Promise}
 */
function dynamoUpdate(dynamo, params) {
  return new Promise((resolve, reject) => {
    dynamo.update(params, (err, data) => {
      logger(`UPDATE ${params.TableName}`, err, data);
      if(err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * Delete an item of a DynamoDB table.
 * @param {any} dynamo The istance of DynamoDB to use
 * @param {any} params The params to apply to DynamoDB's function
 * @return {Promise}
 */
function dynamoDelete(dynamo, params) {
  return new Promise((resolve, reject) => {
    dynamo.delete(params, (err, data) => {
      logger(`DELETE ${params.TableName}`, err, params.Key);
      if(err) reject(err);
      else resolve(data);
    });
  });
}

/**
 * Get group of items based on their keys from DynamoDb table, 
 * avoiding the limits of DynamoDB's BatchGetItem.
 * @param {any} dynamo the istance of DynamoDB to use
 * @param {string} table DynamoDB table on which to operate
 * @param {Array<any>} keys the keys of items to get
 * @param {boolean} ignoreErrors optional; if true, ignore the errors and continue the bulk op.
 * @return {Promise}
 */
function dynamoBatchGet(dynamo, table, keys, ignoreErrors) {
  return new Promise((resolve, reject) => {
    if(keys.length == 0) {
      logger(`BATCH GET ${table}`, null, `No elements to get`);
      resolve();
    } else {
      ignoreErrors = Boolean(ignoreErrors); // undefined -> fals
      dynamoBatchGetHelper(dynamo, table, keys, ignoreErrors, 0, 100, resolve, reject);
    }
  });
}
/**
 * @private helper
 */
function dynamoBatchGetHelper(d, t, keys, iErr, curr, size, resolve, reject) {
  // prepare the structure for the bulk operation
  let batch = { RequestItems: {} };
  batch.RequestItems[t] = keys
    .slice(curr, curr+size)
    .map(k => { return { Keys: k } });
  // execute the bulk operation
  d.batchGetItem(batch, err => {
    logger(`BATCH GET ${t}`, err, `${curr} of ${keys.length}`);
    if(err && !iErr) reject(err);
    // if there are still chunks to manage, go on recursively
    else if(curr+CHUNK_SIZE < keys.length)
      dynamoBatchGetHelper(d, t, keys, iErr, curr+size, size, resolve, reject);
    // no more chunks to manage: we're done
    else resolve();
  });
}
  
/**
 * Put an array of items in a DynamoDb table, avoiding the limits of DynamoDB's BatchWriteItem.
 * @param {*} dynamo the istance of DynamoDB to use
 * @param {string} table DynamoDB table on which to operate
 * @param {Array<any>} items the items to put
 * @param {boolean} ignoreErrors optional; if true, ignore the errors and continue the bulk op.
 * @return {Promise}
 */
function dynamoBatchPut(dynamo, table, items, ignoreErrors) {
  return new Promise((resolve, reject) => {
    if(items.length == 0) {
      logger(`BATCH WRITE ${table}`, null, `No elements to write`);
      resolve();
    } else {
      ignoreErrors = Boolean(ignoreErrors); // undefined -> false
      dynamoBatchWriteHelper(dynamo, table, items, true, ignoreErrors, 0, 25, resolve, reject);
    }
  });
}
/**
 * Delete an array of items from a DynamoDb table, avoiding the limits of DynamoDB's BatchWriteItem.
 * @param {*} dynamo the istance of DynamoDB to use
 * @param {string} table DynamoDB table on which to operate
 * @param {Array<any>} keys the keys of items to delete
 * @param {boolean} ignoreErrors optional; if true, ignore the errors and continue the bulk op.
 * @return {Promise}
 */
function dynamoBatchDelete(dynamo, table, keys, ignoreErrors) {
  return new Promise((resolve, reject) => {
    if(keys.length == 0) {
      logger(`BATCH WRITE ${table}`, null, `No elements to write`);
      resolve();
    } else {
      ignoreErrors = Boolean(ignoreErrors); // undefined -> fals
      dynamoBatchWriteHelper(dynamo, table, keys, false, ignoreErrors, 0, 25, resolve, reject);
    }
  });
}
/**
 * @private helper
 */
function dynamoBatchWriteHelper(d, t, items, iErr, isPut, curr, size, resolve, reject) {
  // prepare the structure for the bulk operation
  let batch = { RequestItems: {} };
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
  d.batchWriteItem(batch, err => {
    logger(`BATCH WRITE ${t}`, err, `${curr} of ${items.length}`);
    if(err && !iErr) reject(err);
    // if there are still chunks to manage, go on recursively
    else if(curr+CHUNK_SIZE < items.length)
      dynamoBatchWriteHelper(d, t, items, iErr, isPut, curr+size, size, resolve, reject);
    // no more chunks to manage: we're done
    else resolve();
  });
}

/**
 * Query a DynamoDb table, avoiding the limits of DynamoDB's Query.
 * @param {*} dynamo the istance of DynamoDB to use
 * @param {*} params the params to apply to DynamoDB's function
 * @param {Array<any>} initialItems optional; an array of items to start with
 * @return {Promise}
 */
function dynamoQuery(dynamo, params, initialItems) {
  return new Promise((resolve, reject) => {
    initialItems = initialItems || [];
    dynamoQueryScanHelper(dynamo, params, initialItems, true, resolve, reject);
  });
}
/**
 * Scan a DynamoDb table, avoiding the limits of DynamoDB's Query.
 * @param {*} dynamo the istance of DynamoDB to use
 * @param {*} params the params to apply to DynamoDB's function
 * @param {Array<any>} initialItems optional; an array of items to start with
 * @return {Promise}
 */
function dynamoScan(dynamo, params, initialItems) {
  return new Promise((resolve, reject) => {
    initialItems = initialItems || [];
    dynamoQueryScanHelper(dynamo, params, initialItems, false, resolve, reject);
  });
}
/**
 * @private helper
 */
function dynamoQueryScanHelper(dynamo, params, items, isQuery, resolve, reject) {
  let f = isQuery ? 'query' : 'scan';
  dynamo[f](params, (err, data) => {
    if(err || !data || !data.Items) {
      logger(`SCAN ${table}`, err, data);
      return reject(err);
    }
    items = items.concat(data.Items);
    if(data.LastEvaluatedKey) {
      params.ExclusiveStartKey = data.LastEvaluatedKey;
      dynamoQueryScanHelper(dynamo, params, items, false, resolve, reject);
    } else {
      logger(`SCAN ${table}` , null, items.length);
      resolve(items);
    }
  });
}


///
/// COGNITO
///

/**
 * Helper to get the attributes of the user from the authorizer claims.
 * @param {any} claims Cognito authentication claims after API gateway's integration.
 * @return {any} user's data
 */
function cognitoGetUserByClaims(claims) {
  let user = {};
  // add any additional cognito attribute available in cognito
  for(let p in claims) if(p.startsWith('cognito:')) user[p.slice(8)] = claims[p];
  // map the important attributes with reserved names
  user.userId = claims.sub;
  user.email = claims.email;
  user.name = claims.name;
  user.phoneNumber = claims.phone_number;
  return user;
}

/**
 * Helper function to identify a user by its email address, returning then its attributes.
 * @param {string} email user's email
 * @param {string} cognitoUserPoolId if not specified, use env var COGNITO_USER_POOL_ID
 * @return {Promise}
 */
function cognitoGetUserByEmail(email, cognitoUserPoolId) {
  return new Promise((resolve, reject) => {
  // read the parameters from env. var or force them
    cognitoUserPoolId = cognitoUserPoolId || COGNITO_USER_POOL_ID;
    // find the user by the email
    new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })
    .listUsers({ UserPoolId: cognitoUserPoolId, Filter: `email = "${email}"`, Limit: 1},
    (err, data) => {
      if(err || !data || !data.Users || !data.Users[0]) reject();
      else {
        // convert and return the attributes
        let userAttributes = [];
        data.Users[0].Attributes.forEach(a => userAttributes[a.Name] = a.Value);
        resolve(userAttributes);
      }
    });
  });
}

/**
 * Helper function to identify a user by its sub, returning then its attributes.
 * @param {string} email user's sub (userId)
 * @param {string} cognitoUserPoolId if not specified, use env var COGNITO_USER_POOL_ID
 * @return {Promise}
 */
function cognitoGetUserBySub(sub, cognitoUserPoolId) {
  return new Promise((resolve, reject) => {
    // read the parameters from env. var or force them
    cognitoUserPoolId = cognitoUserPoolId || COGNITO_USER_POOL_ID;
    // find the user by the sub
    new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })
    .listUsers({ UserPoolId: cognitoUserPoolId, Filter: `sub = "${sub}"`, Limit: 1},
    (err, data) => {
      if(err || !data || !data.Users || !data.Users[0]) reject();
      else {
        // convert and return the attributes
        let userAttributes = [];
        data.Users[0].Attributes.forEach(a => userAttributes[a.Name] = a.Value);
        resolve(userAttributes);
      }
    });
  });
}


///
/// SES
///

/**
 * Send an email through AWS Simple Email Service.
 * @param {any} emailData
 *  toAddresses: Array<string>, ccAddresses?: Array<string>, bccAddresses?: Array<string>,
 *  replyToAddresses: Array<string>, subject: string, html?: string, text?: string,
 *  attachments?: Array<any> (https://community.nodemailer.com/using-attachments/)
 * @param {any} sesParams optional; region, source, sourceName, sourceArn
 * @return {Promise}
 */
function sesSendEmail(emailData, sesParams) {
  return new Promise((resolve, reject) => {
    // default SES parameters
    if(!sesParams) sesParams = {};
    sesParams.region = sesParams.region || SES_DEFAULT_REGION;
    sesParams.source = sesParams.source || SES_DEFAULT_SOURCE;
    sesParams.sourceName = sesParams.sourceName || SES_DEFAULT_SOURCE_NAME;
    sesParams.sourceArn = sesParams.sourceArn || SES_DEFAULT_SOURCE_ARN;
    // prepare SES email data
    let sesData = {};
    sesData.Destination = {};
    if(emailData.toAddresses) sesData.Destination.ToAddresses = emailData.toAddresses;
    if(emailData.ccAddresses) sesData.Destination.CcAddresses = emailData.ccAddresses;
    if(emailData.bccAddresses) sesData.Destination.BccAddresses = emailData.bccAddresses;
    sesData.Message = {};
    if(emailData.subject) sesData.Message.Subject = { Charset: 'UTF-8', Data: emailData.subject };
    sesData.Message.Body = {};
    if(emailData.html) sesData.Message.Body.Html = { Charset: 'UTF-8', Data: emailData.html };
    if(emailData.text) sesData.Message.Body.Text = { Charset: 'UTF-8', Data: emailData.text };
    if(!emailData.html && !emailData.text) sesData.Message.Body.Text = { Charset: 'UTF-8', Data: '' };
    sesData.ReplyToAddresses = emailData.replyToAddresses;
    sesData.Source = `${sesParams.sourceName} <${sesParams.source}>`;
    sesData.SourceArn = sesParams.sourceArn;
    let ses = new AWS.SES({ region: sesParams.region });
    // send email
    if(emailData.attachments && emailData.attachments.length) {
      // including attachments, through Nodemailer
      sesSendEmailThroughNodemailer(ses, sesData, emailData.attachments)
      .then(res => resolve(res))
      .catch(err => reject(err));
    } else {
      // classic way, through SES
      ses.sendEmail(sesData, (err, data) => { 
        logger('SES SEND EMAIL', err, data);
        if(err) reject(err);
        else resolve(data); 
      });
    }
  });
}
/**
 * Helper function to send an email with attachments through Nodemailer;
 * SES only supports attachments through a raw sending.
 * @param {*} ses SES instance
 * @param {*} sesData SES data and params
 * @param {*} attachments array of attachments to send
 * @return {Promise}
 */
function sesSendEmailThroughNodemailer(ses, sesData, attachments) {
  return new Promise((resolve, reject) => {
    // set the mail options in Nodemailer's format
    let mailOptions = {};
    mailOptions.from = sesData.Source;
    mailOptions.to = sesData.Destination.ToAddresses.join(',');
    if(sesData.Message.Body.cc) mailOptions.cc = sesData.Destination.CcAddresses.join(',');
    if(sesData.Message.Body.bcc) mailOptions.bcc = sesData.Destination.BccAddresses.join(',');
    if(sesData.Message.Body.ReplyToAddresses)
      mailOptions.replyTo = sesData.ReplyToAddresses.join(',');
    mailOptions.subject = sesData.Message.Subject.Data;
    if(sesData.Message.Body.Html) mailOptions.html = sesData.Message.Body.Html.Data;
    if(sesData.Message.Body.Text) mailOptions.text = sesData.Message.Body.Text.Data;
    mailOptions.attachments = attachments;
    // create Nodemailer SES transporter
    let transporter = Nodemailer.createTransport({ SES: ses });
    // send the email
    transporter.sendMail(mailOptions, (err, data) => { 
      logger('SES SEND EMAIL (NODEMAILER)', err, data);
      if(err) reject(err);
      else resolve(data); 
    });
  });
}


///
/// S3
///

/**
 * Download a file through an S3 signed url.
 * *Pratically*, it uploads the file on an S3 bucket (w/ automatic cleaning),
 * it generates a signed url, returning it.
 * @param {string} prefix a folder in which to put all the files of the same kind
 * @param {string} key the unique filepath
 * @param {any} dataToUpload usually a buffer
 * @param {string} contentType e.g. application/json
 * @param {string} bucket optional; an alternative Downloads bucket to the default one
 * @param {number} secToExp optional; seconds to url expiration
 * @return {Promise}
 */
function downloadThroughS3Url(prefix, key, dataToUpload, contentType, bucket, secToExp) {
  return new Promise((resolve, reject) => {
    key = `${prefix || S3_DEFAULT_DOWNLOAD_BUCKET_PREFIX}/${key}`;
    bucket = bucket || S3_DEFAULT_DOWNLOAD_BUCKET;
    secToExp = secToExp || S3_DEFAULT_DOWNLOAD_BUCKET_SEC_TO_EXP;
    S3.upload({ Bucket: bucket, Key: key, Body: dataToUpload, ContentType: contentType },
    (err, data) => {
      logger('S3 UPLOAD', err, data);
      if(err) reject(err);
      else resolve(S3.getSignedUrl('getObject', { Bucket: bucket, Key: key, Expires: secToExp }));
    });
  });
}


///
/// SNS
///

/**
 * Create a new endpoint in the SNS platform specified.
 * @param {string} platform enum: APNS, FCM
 * @param {string} deviceId registrationId
 * @return {Promise}
 */
function createSNSPushPlatormEndpoint(platform, deviceId) {
  return new Promise((resolve, reject) => {
    let platformARN;
    // identify the platform ARN
    switch(platform) {
      case 'APNS': platformARN = SNS_PUSH_PLATFORM_ARN_IOS; break;
      case 'FCM': platformARN = SNS_PUSH_PLATFORM_ARN_ANDROID; break;
      default: return reject(new Error(`UNSUPPORTED_PLATFORM`));
    }
    // create a new endpoint in the platform
    SNS.createPlatformEndpoint({ PlatformApplicationArn: platformARN, Token: deviceId },
    (err, data) => {
      logger('SNS ADD PLATFORM ENDPOINT', err, data);
      if(err || !data.EndpointArn) reject(err);
      else resolve(data.EndpointArn);
    });
  });
}

/**
 * Send a push notification through a SNS endpoint.
 * @param {string} message the message to send
 * @param {string} platform enum: APNS, FCM
 * @param {string} endpoint endpoint to a specific device
 * @return {Promise}
 */
function publishSNSPush(message, platform, endpoint) {
  return new Promise((resolve, reject) => {
    let structuredMessage;
    switch(platform) {
      case 'APNS':
        structuredMessage = { APNS: JSON.stringify({ aps: { alert: message } }) };
      break;
      case 'FCM':
        structuredMessage = { GCM: JSON.stringify({ data: { message: message } }) };
      break;
      default: return reject(new Error(`UNSUPPORTED_PLATFORM`));
    }
    SNS.publish({
      MessageStructure: 'json', Message: JSON.stringify(structuredMessage), TargetArn: endpoint
    }, (err, data) => {
      logger('SNS PUSH NOTIFICATION', err, data);
      if(err) reject(err);
      else resolve(data);
    });
  });
}


///
/// API GATEWAY
///

/**
 * Request wrapper to enable API requests with simplified parameters
 * @param {string} method enum: HTTP methods
 * @param {any} options typical requests options (e.g. url, body, headers, etc.)
 * @param {number} delay optional; if set, the request is executed after a certain delay (in ms).
 *  Useful to avoid overwhelming the back-end when the execution isn't time pressured.
 * @return {Promise}
 */
function requestToAPI(method, options, delay) {
  return new Promise((resolve, reject) => {
    delay = delay || 1; // ms
    setTimeout(() => {
      // prepare the parameters and the options
      method = method.toLowerCase();
      options.body = options.body ? JSON.stringify(options.body) : null;
      options.url = encodeURI(options.url);
      // execute the request and reject or resolve the promise
      Request[method](options, (err, res) => {
        if(err) reject(err)
        else if(res.statusCode !== 200) reject(`[${res.statusCode}] ${res.body}`);
        else {
          try { resolve(JSON.parse(res.body)); }
          catch(err) { return reject(err); }
        }
      });
    }, delay);
  });
}

/**
 * Default callback for IDEA's API resource controllers.
 * @param {Error | any} err if not null, it contains the error raised
 * @param {any} res if err, the error string, otherwise the result (a JSON to parse)
 * @param {any} callback the AWS Lambda function callback
 */
function requestDoneAPI(err, res, callback) {
  logger(`[DONE]`, err, res);
  callback(null, {
    statusCode: err ? '400' : '200',
    body: err ?  JSON.stringify(err.message) : JSON.stringify(res),
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  })
}


///
/// CLOUDWATCH
///

/**
 * Add a formatted log in CloudWatch.
 * @param {string} context context in which the content apply
 * @param {Error | any} err error
 * @param {string} content the content to log
 * @param {boolean} important optional; if true, highlight the line in CloudWatch
 */
function logger(context, err, content, important) {
  context = context || '';
  if(err) console.error('[ERROR]', context, '≫', err, content);
  else if(important) console.log('[!! IMPORTANT !!]', context, '≫', content);
  else console.log('\t', context, '≫', content); // to give less importance to debug info
}


///
/// UTILITIES
///

/**
 * Convert an ISODate string to the Italian format
 * @param {string} ISODateString new Date().toISOString();
 * @return cleaned date
 */
function ISODateToItalianFormat(ISODateString) {
  return `${ISODateString.slice(8, 10)}/${ISODateString.slice(5, 7)}/${ISODateString.slice(0, 4)}`;
}

/**
 * Clean a string to use it within filenames and so.
 * @param {string} str the string to clean
 * @param {string} separator separator char
 * @return cleaned string
 */
function cleanStr(str, separator) {
  return (str || '').toLowerCase().replace(/[^a-zA-Z0-9]+/g, separator || '');
}

/**
 * Join two arrays by a common column, selecting which data to extract.
 * @param {Array<any>} mainTable the main array
 * @param {Array<any>} lookupTable the lookup array
 * @param {string} mainKey mainTable's column for the join condition
 * @param {string} lookupKey lookupTable's column for the join condition
 * @param {(attrMainTable, attrLookupTable) => Array<any>} selectFunction defines which attributes we want to retain in the joined array; null values generated by the function are ignored
 * @return {Array<any>} the joined array
 */
function joinArraysOnKeys(mainTable, lookupTable, mainKey, lookupKey, selectFunction) {
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
 * @param {string} type optional; to set to force a type check; enum: string, number, date, boolean
 */
function isEmpty(field, type) {
  if(!field) return true; // null, undefined
  if(!type) type = typeof field; // try to auto-detect
  if(!type) return true; // undefined
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
 * Save the content of an object to the desired folder (as a log file).
 * @param {string} name name of the object (== filename)
 * @param {any} obj the JSON object
 * @param {string} folder if null, uses the Config.LOGS.FOLDER
 */
function saveObjToFile(name, obj, folder) {
  folder = folder || Config.LOGS.FOLDER;
  Fs.writeFileSync(`${folder}/${name}.json`, JSON.stringify(obj));
}