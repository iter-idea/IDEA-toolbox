declare namespace Idea {
// DYNAMO
  export function ES2N(string: string): string;
  export function Obj2N(obj: any, maxDepth?: number, currentDepth?: number): any;
  export function IUID(dynamo: any, project: string, attempt?: number, 
    maxAttempts?: number): Promise<string>;
	export function getAtomicCounterByKey(dynamo: any, key: string): Promise<number>;
	export function dynamoGet(dynamo: any, params: any): Promise<any>;
	export function dynamoPut(dynamo: any, params: any): Promise<any>;
	export function dynamoUpdate(dynamo: any, params: any): Promise<any>;
	export function dynamoDelete(dynamo: any, params: any): Promise<any>;
  export function dynamoBatchGet(dynamo: any, table: string, keys: Array<any>, 
    ignoreErrors?: boolean): Promise<any>;
	export function dynamoBatchPut(dynamo: any, table: string, items: Array<any>, 
    ignoreErrors?: boolean): Promise<any>;
	export function dynamoBatchDelete(dynamo: any, table: string, keys: Array<any>, 
    ignoreErrors?: boolean): Promise<any>;
  export function dynamoQuery(dynamo: any, params: any, initialItems?: Array<any>): Promise<any>;
	export function dynamoScan(dynamo: any, params: any, initialItems?: Array<any>): Promise<any>;
// COGNITO
  export function cognitoGetUserByClaims(claims: any): any;
  export function cognitoGetUserByEmail(email: string, 
    cognitoUserPoolId?: string): Promise<Array<string>>;
  export function cognitoGetUserBySub(sub: string, 
    cognitoUserPoolId?: string): Promise<Array<string>>;
// SES
  export function sesSendEmail(emailData: any, sesParams?: any): Promise<any>;
// S3
  export function downloadThroughS3Url(prefix: string, key: string, dataToUpload: any, 
    contentType: string, bucket?: string, secToExp?: number): Promise<any>;
// SNS
  export function createSNSPushPlatormEndpoint(platform: string, deviceId: string): Promise<any>;
	export function publishSNSPush(message: string, platform: string, endpoint: string): Promise<any>;
// API GATEWAY
  export function requestToAPI(method: string, options: any, delay?: number): Promise<any>;
  export function requestDoneAPI(err: Error | any, res: any, callback: any);
  export interface APIRequestParams {
    claims: any; principalId: string; body: any; queryParams: any; resourceId: string; tables: any;
  };
// CLOUDWATCH
  export function logger(context: string, err: Error | any, content?: string, important?: boolean);
// UTILITIES
  export function ISODateToItalianFormat(ISODateString: string): string;
	export function cleanStr(str: string, separator?: string): string;
  export function joinArraysOnKeys(mainTable: Array<any>, lookupTable: Array<any>, 
    mainKey: string, lookupKey: string, selectFunction: any): Array<any>;
	export function isEmpty(field: any, type?: string): boolean;
  export function saveObjToFile(name: string, obj: any, folder?: string);
}
export = Idea;