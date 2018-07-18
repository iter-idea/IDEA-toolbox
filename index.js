'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3({ apiVersion: '2006-03-01' });
const SNS = new AWS.SNS({ apiVersion: '2010-03-31', region: process.env['SNS_PUSH_REGION'] });
const UUIDV4 = require('uuid/v4');
const Nodemailer = require('nodemailer');
const Fs = require('fs');

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
  ES2N, Obj2N, dynamoBatchOperation, dynamoBatchOp, dynamoQueryOverLimit, dynamoScanOverLimit, 
  IUID, getAtomicCounterByKey,
// COGNITO
  cognitoGetUserByClaims, cognitoGetUserByEmail, cognitoGetUserBySub,
// SES
  sesSendEmail,
// S3
  downloadThroughS3Url,
// SNS
  createSNSPushPlatormEndpoint, publishSNSPush,
// UTILITIES
  ISODateToItalianFormat, cleanStr, joinArraysOnKeys, isEmpty, requestToAPI, saveObjToFile
}

///
/// DYNAMO
///

/**
 * Helper to solve the known problem of Amazon DB with empty strings:
 * if the string is empty, return null
 * Ref. https://forums.aws.amazon.com/thread.jspa?threadID=90137
 * @param {string} string string to remap
 * @return cleaned string
 */
function ES2N(string) {
  return (!string || string.length == 0) ? null : string;
}

/**
 * Helper to naively solve the empty string / undefined attributes in Dynamo.
 * Disclaimer: it can be really slow, so use it only when necessary
 * (otherwise prefer the quicker ES2N).
 * @param {*} obj obj to remap
 * @param {number} maxDepth max deepness in which to nest the function.
 * @param {number} currentDepth to skip initial levels, if needed
 * @return cleaned object
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
 * Recursively insert chunks of items in a dynamoDB table.
 * Note: errors are printed but ignored.
 * @param {*} dynamo The istance of DynamoDB to use
 * @param {*} batchOps The batch operations to execute, in the DynamoDB's batchWriteItems format
 * @param {string} table DynamoDB table on which to operate
 * @param {number} currentChunk Which chunk of operations are considering now (0 at the first call)
 * @param {number} chunkSize Suggested dimension: 25
 * @param {*} doneCb (err, numOpsExecuted) => {} called when everything's finished or after an error
 * @param {boolean} ignoreErrors optional; if true, ignore the errors and continue the bulk op.
 */
function dynamoBatchOp(dynamo, batchOps, table, currentChunk, chunksSize, doneCb, ignoreErrors) {
  if(batchOps.length == 0) return doneCb(null, 0);
  chunksSize = chunksSize || 25;
  ignoreErrors = Boolean(ignoreErrors); // undefined -> false
  console.log(`Batch operation on ${table}: ${currentChunk} of ${batchOps.length}`);
  // prepare the structure for the bulk operation
  var batch = { RequestItems: {} };
  // create the chunk
  batch.RequestItems[table] = batchOps.slice(currentChunk, currentChunk+chunksSize);
  // execute the bulk operation
  dynamo.batchWriteItem(batch, err => {
    if(err && !ignoreErrors) doneCb(err);
    // if there are still chunks to manage, go on recursively
    else if(currentChunk+chunksSize < batchOps.length)
      dynamoBatchOperation(dynamo, batchOps, table, currentChunk+chunksSize, chunksSize, doneCb);
    // no more chunks to manage: we're done
    else doneCb(null, batchOps.length);
  });
}

/**
 * !! OLD: use dynamoBatchOp instead! (temporarily kept for compatibility).
 * NOTE WELL: soon it will be removed.
 */
function dynamoBatchOperation(dynamo, batchOps, table, currentChunk, chunksSize, doneCb) {
  if(batchOps.length == 0) return doneCb(0);
  chunksSize = chunksSize || 25;
  console.log(`Batch operation on ${table}: ${currentChunk} of ${batchOps.length}`);
  // prepare the structure for the bulk operation
  var batch = { RequestItems: {} };
  // create the chunk
  batch.RequestItems[table] = batchOps.slice(currentChunk, currentChunk+chunksSize);
  // execute the bulk operation
  dynamo.batchWriteItem(batch, info => {
    console.log(info);
    // if there are still chunks to manage, go on recursively
    if(currentChunk+chunksSize < batchOps.length)
      dynamoBatchOperation(dynamo, batchOps, table, currentChunk+chunksSize, chunksSize, doneCb);
    // no more chunks to manage: we're done
    else doneCb(batchOps.length);
  });
}

/**
 * Function to recursively query a table, avoiding the 1MB limit of DynamoDB
 * @param {*} dynamo The istance of DynamoDB to use
 * @param {*} queryParams The params to apply to DynamoDB's query function
 * @param {*} callback (err, data) => {} Callback function
 * @param {Array<any>} items *Optional*. An array of items to start with.
 */
function dynamoQueryOverLimit(dynamo, queryParams, callback, items) {
  items = items || [];
  dynamo.query(queryParams, (err, data) => {
    if(err || !data || !data.Items) return callback(err);
    else items = items.concat(data.Items);
    if(data.LastEvaluatedKey) {
      queryParams.ExclusiveStartKey = data.LastEvaluatedKey;
      dynamoQueryOverLimit(dynamo, queryParams, callback, items);
    } else callback(null, items);
  });
}

/**
 * Helper function to recursively scan a table, avoiding the 1MB limit of DynamoDB
 * @param {*} dynamo The istance of DynamoDB to use
 * @param {*} scanParams The params to apply to DynamoDB's scan function
 * @param {*} callback (err, data) => {} Callback function
 * @param {Array<any>} items *Optional*. An array of items to start with.
 */
function dynamoScanOverLimit(dynamo, scanParams, callback, items) {
  items = items || [];
  dynamo.scan(scanParams, (err, data) => {
    if(err || !data || !data.Items) return callback(err);
    else items = items.concat(data.Items);
    if(data.LastEvaluatedKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
      dynamoScanOverLimit(dynamo, scanParams, callback, items)
    } else callback(null, items);
  })
}

/**
 * Returns an IUID: IDEA's Unique IDentifier, which is an id unique through all IDEA's projects.
 * Note: there's no need of an authorization check for extrernal uses: the permissions depend
 * from the context in which it's executed.
 * @param {string} project the project to use as domain
 * @param {*} cb (id) => {}; if false, id hasn't been correctly generated
 */
function IUID(dynamo, project, cb, attempt, maxAttempts) {
  if(!project) return cb(false);
  attempt = attempt || 0;
  maxAttempts = maxAttempts || 3;
  if(attempt > maxAttempts) return cb(false);
  let id = UUIDV4();
  dynamo.getItem({ TableName: 'idea_IUID', Key: { project: project, id: id } },
  (err, data) => {
    if(data && data.Item)
      return IUID(dynamo, project, cb, attempt+1, maxAttempts); // ID exists, try again
    else dynamo.putItem({ TableName: 'idea_IUID', Item: { project: project, id: id } },
    (err, data) => {
      if(err) cb(false);
      else cb(project+'_'+id);
    });
  });
}

/**
 * Manage atomic counters (atomic autoincrement values) in IDEA's projects.
 * They key of an atomic counter should be composed as the following:
 * `DynamoDBTableName_uniqueKey`, where uniqueKey often coincides with the teamId
 * @param {*} dynamo The istance of DynamoDB to use
 * @param {string} key The key of the counter
 * @param {*} cb (counter) => {} Callback function
 */
function getAtomicCounterByKey(dynamo, key, cb) {
  console.log('Getting atomic counter of', key);
  let one = 1; // can't assign directly a number
  dynamo.updateItem({
    TableName: 'idea_atomicCounters', Key: { key: key },
    UpdateExpression: 'ADD atomicCounter :increment',
    ExpressionAttributeValues: { ':increment': one },
    ReturnValues: 'UPDATED_NEW'
  }, (err, data) => {
    if(err) cb(null);
    else cb(data.Attributes.atomicCounter);
  });
}

///
/// COGNITO
///

/**
 * Helper to get the attributes of the user from the authorizer claims.
 * @param {*} claims Cognito authentication claims after API gateway's integration.
 * @return {Array<string>} user's data
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
 * @param {*} cb (err, data) => {}
 * @param {string} cognitoUserPoolId Cognito user pool
 */
function cognitoGetUserByEmail(email, cb, cognitoUserPoolId) {
  // read the parameters from env. var or force them
  cognitoUserPoolId = cognitoUserPoolId || COGNITO_USER_POOL_ID;
  // find the user by the email
  new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })
  .listUsers({ UserPoolId: cognitoUserPoolId, Filter: `email = "${email}"`, Limit: 1},
  (err, data) => {
    if(err || !data || !data.Users || !data.Users[0]) return cb();
    // convert and return the attributes
    let userAttributes = [];
    data.Users[0].Attributes.forEach(a => userAttributes[a.Name] = a.Value);
    cb(userAttributes);
  });
}

/**
 * Helper function to identify a user by its sub, returning then its attributes.
 * @param {string} email user's sub (userId)
 * @param {*} cb (err, data) => {}
 * @param {string} cognitoUserPoolId Cognito user pool
 */
function cognitoGetUserBySub(sub, cb, cognitoUserPoolId) {
  // read the parameters from env. var or force them
  cognitoUserPoolId = cognitoUserPoolId || COGNITO_USER_POOL_ID;
  // find the user by the sub
  new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })
  .listUsers({ UserPoolId: cognitoUserPoolId, Filter: `sub = "${sub}"`, Limit: 1},
  (err, data) => {
    if(err || !data || !data.Users || !data.Users[0]) return cb();
    // convert and return the attributes
    let userAttributes = [];
    data.Users[0].Attributes.forEach(a => userAttributes[a.Name] = a.Value);
    cb(userAttributes);
  });
}

///
/// SES
///

/**
 * Send an email through AWS Simple Email Service.
 * @param {*} emailData
 *  toAddresses: Array<string>, ccAddresses?: Array<string>, bccAddresses?: Array<string>,
 *  replyToAddresses: Array<string>, subject: string, html?: string, text?: string,
 *  attachments?: Array<any> (https://community.nodemailer.com/using-attachments/)
 * @param {*} cb (err, data) => {}
 * @param {*} sesParams (optional) region, source, sourceName, sourceArn
 */
function sesSendEmail(emailData, cb, sesParams) {
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
    console.log('SES send email w/ attachments (Nodemailer)',
      sesParams, sesData, emailData.attachments);
    sesSendEmailThroughNodemailer(ses, sesData, emailData.attachments, cb);
  } else {
    // classic way, through SES
    console.log('SES send email', sesParams, sesData);
    ses.sendEmail(sesData, (err, data) => { cb(err, data); });
  }
}
/**
 * Helper function to send an email with attachments through Nodemailer;
 * SES only supports attachments through a raw sending.
 * @param {*} ses SES instance
 * @param {*} sesData SES data and params
 * @param {*} attachments array of attachments to send
 * @param {*} cb (err, data) => {}
 */
function sesSendEmailThroughNodemailer(ses, sesData, attachments, cb) {
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
  transporter.sendMail(mailOptions, (err, data) => { cb(err, data); });
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
 * @param {*} dataToUpload usually a buffer
 * @param {string} contentType e.g. application/json
 * @param {*} cb (err, url) => {}
 * @param {string} bucket (optional) an alternative Downloads bucket to the default one
 * @param {number} secToExp (optional), seconds to url expiration
 */
function downloadThroughS3Url(prefix, key, dataToUpload, contentType, cb, bucket, secToExp) {
  key = `${prefix || S3_DEFAULT_DOWNLOAD_BUCKET_PREFIX}/${key}`;
  bucket = bucket || S3_DEFAULT_DOWNLOAD_BUCKET;
  secToExp = secToExp || S3_DEFAULT_DOWNLOAD_BUCKET_SEC_TO_EXP;
  S3.upload({ Bucket: bucket, Key: key, Body: dataToUpload, ContentType: contentType },
  (err, data) => {
    console.log('Uploading file on S3...', err, data);
    if(err) cb(err);
    else {
      const url = S3.getSignedUrl('getObject', { Bucket: bucket, Key: key, Expires: secToExp });
      console.log('Generated signed url', url);
      cb(null, url);
    }
  });
}

///
/// SNS
///

/**
 * Create a new endpoint in the SNS platform specified.
 * @param {string} platform enum: APNS, FCM
 * @param {string} deviceId registrationId
 * @param {*} done cb(err, data) => {}
 */
function createSNSPushPlatormEndpoint(platform, deviceId, done) {
  let platformARN;
  // identify the platform ARN
  switch(platform) {
    case 'APNS': platformARN = SNS_PUSH_PLATFORM_ARN_IOS; break;
    case 'FCM': platformARN = SNS_PUSH_PLATFORM_ARN_ANDROID; break;
    default: return done(new Error());
  }
  // create a new endpoint in the platform
  SNS.createPlatformEndpoint({ PlatformApplicationArn: platformARN, Token: deviceId },
  (err, data) => {
    console.log('Creating SNS platform endpoint', platformARN, err, data);
    if(err || !data.EndpointArn) done(err || new Error());
    else done(null, data.EndpointArn);
  });
}

/**
 * Send a push notification through a SNS endpoint.
 * @param {string} message the message to send
 * @param {string} platform enum: APNS, FCM
 * @param {string} endpoint endpoint to a specific device
 * @param {*} done cb(err, data) => {}
 */
function publishSNSPush(message, platform, endpoint, done) {
  if(!done) done = () => {};
  let structuredMessage;
  switch(platform) {
    case 'APNS':
      structuredMessage = { APNS: JSON.stringify({ aps: { alert: message } }) };
    break;
    case 'FCM':
      structuredMessage = { GCM: JSON.stringify({ data: { message: message } }) };
    break;
    default: return done(new Error());
  }
  SNS.publish({
    MessageStructure: 'json', Message: JSON.stringify(structuredMessage), TargetArn: endpoint
  }, (err, data) => {
    console.log('Sending push notification', endpoint, err, data);
    done(err, data);
  });
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
 * @param {*} field the field to check
 * @param {*} type (optional, to set to force a type check); enum: string, number, date, boolean
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
 * Request wrapper to enable API requests with simplified parameters
 * @param {string} method enum: HTTP methods
 * @param {*} options typical requests options (e.g. url, body, headers, etc.)
 * @param {number} delay optional; if set, the request is executed after a certain delay (in ms).
 *  Useful to avoid overwhelming the back-end when the execution isn't time pressured.
 * @return Promise
 */
function requestToAPI(method, options, delay) {
  return new Promise((resolve, reject) => {
    delay = delay || 1; // ms
    setTimeout(() => {
      // prepare the parameters and the options
      method = method.toLowerCase();
      options.body = options.body ? JSON.stringify(options.body) : null;
      // execute the request and reject or resolve the promise
      Request[method](options, (err, data) => {
        if(err) reject(err);
        else resolve(JSON.parse(data.body));
      });
    }, delay);
  });
}

/**
 * Save the content of an object to the desired folder (as a log file).
 * @param {*} name name of the object (== filename)
 * @param {*} obj the JSON object
 * @param {*} folder if null, uses the Config.LOGS.FOLDER
 */
function saveObjToFile(name, obj, folder) {
  folder = folder || Config.LOGS.FOLDER;
  Fs.writeFileSync(`${folder}/${name}.json`, JSON.stringify(obj));
}