'use strict';

module.exports = {
  ES2N, Obj2N,
  dynamoBatchOperation, dynamoQueryOverLimit
}

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
  if(!obj || typeof obj != 'object') return obj;
  if(!maxDepth) maxDepth = 0;
  if(!currentDepth) currentDepth = 0;
  for(var prop in obj) {
    if(obj[prop] == undefined) obj[prop] = null;
    else if(typeof obj[prop] == 'string') obj[prop] = ES2N(obj[prop]);
    else if(typeof obj[prop] == 'object' && currentDepth < maxDepth)
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
      dynamoBatchOperation(batchOps, table, currentChunk+chunksSize, chunksSize, doneCb);
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
      dynamoScanOverLimit(scanParams, items, callback);
    } else callback(null, items);
  });
}
