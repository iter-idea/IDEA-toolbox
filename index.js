'use strict';

const UUIDV4 = require('uuid/v4');
const Mailgun = require('mailgun-js');

module.exports = {
// DYNAMO
  ES2N, Obj2N, dynamoBatchOperation, dynamoQueryOverLimit, IUID, getAtomicCounterByKey,
// COGNITO
  cognitoGetUserByClaims, cognitoGetUserByEmail,
// MAILGUN
  mailgunSendEmail,
// OTHER
  ISODateToItalianFormat
}

///
/// DYNAMO
///

/**
 * Helper to solve the known problem of Amazon DB with empty strings:
 * if the string is empty, return null
 * Ref. https://forums.aws.amazon.com/thread.jspa?threadID=90137
 * @param string string to remap
 */
function ES2N(string) {
  return (!string || string.length == 0) ? null : string;
}

/**
 * Helper to naively solve the empty string / undefined attributes in Dynamo.
 * Disclaimer: it can be really slow, so use it only when necessary
 * (otherwise prefer the quicker ES2N).
 * @param obj obj to remap
 * @param maxDepth max deepness in which to nest the function.
 * @param currentDepth to skip initial levels, if needed
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
 * @param dynamo The istance of DynamoDB to use
 * @param batchOps The batch operatons to execute, in the DynamoDB's batchWriteItems format
 * @param table DynamoDB table on which to operate
 * @param currentChunk Which chunk of operations are considering now (0 at the first call)
 * @param chunkSize Suggested dimension: 25
 * @param doneCb Callback function to call when everything is finished
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
 * @param dynamo The istance of DynamoDB to use
 * @param scanParams The params to apply to DynamoDB's scan function
 * @param callback Callback function
 * @param items *Optional*. An array of items to start with.
 */
function dynamoQueryOverLimit(dynamo, scanParams, callback, items) {
  items = items || [];
  dynamo.query(scanParams, (err, data) => {
    if(err || !data || !data.Items) return callback(err);
    else items = items.concat(data.Items);
    if(data.LastEvaluatedKey) {
      scanParams.ExclusiveStartKey = data.LastEvaluatedKey;
      dynamoQueryOverLimit(dynamo, scanParams, callback, items);
    } else callback(null, items);
  });
}

/**
 * Returns an IUID: IDEA's Unique IDentifier, which is an id unique through all IDEA's projects.
 * Note: there's no need of an authorization check for extrernal uses: the permissions depend
 * from the context in which it's executed.
 * @param project the project to use as domain
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
 * @param dynamo The istance of DynamoDB to use
 * @param {string} key The key of the counter
 * @param cb Callback function
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
 * Helper function to get the attributes of the user from the authorizer claims.
 */
function cognitoGetUserByClaims(claims) {
  let user = {};
  // add any additional cognito attribute available in cognito
  for(let p in claims) if(p.startsWith('cognito:')) user[p.slice(8)] = claims[p];
  // map the important attributes with reserved names
  user.userId = claims.sub;
  user.email = claims.email;
  user.phoneNumber = claims.phone_number;
  return user;
}

/**
 * Helper function to identify a user by its email address, returning then its attributes.
 */
function cognitoGetUserByEmail(AWS, accessKeyId, secretAccessKey, cognitoUserPoolId, email, cb) {
  new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18', accessKeyId: accessKeyId, secretAccessKey: secretAccessKey
  })
  .listUsers({ UserPoolId: cognitoUserPoolId, Filter: `email = "${email}"`, Limit: 1},
  (err, data) => {
    if(err) return cb();
    let user = data.Users[0];
    let attributes = [];
    user.Attributes.forEach(a => attributes[a.Name] = a.Value);
    cb(attributes);
  });
}

///
/// MAILGUN
///

/**
 * Send an email through a mailgun account
 * @param {*} mailgunData apiKey, domain
 * @param {*} emailData from, to, replyTo, subject, html
 * @param {*} cb (err) => {}
 */
function mailgunSendEmail(mailgunData, emailData, cb) {
  Mailgun({ apiKey: mailgunData.apiKey, domain: mailgunData.domain })
  .messages().send({
    from: emailData.from,
    to: emailData.to,
    'h:Reply-To': emailData.replyTo,
    subject: emailData.subject,
    html: emailData.html
  }, (err, body) => { cb(err) });
}

///
/// OTHER
///

/**
 * Convert an ISODate string to the Italian format
 * @param {*} ISODateString new Date().toISOString();
 */
function ISODateToItalianFormat(ISODateString) {
  return `${ISODateString.slice(8, 10)}/${ISODateString.slice(5, 7)}/${ISODateString.slice(0, 4)}`;
}
