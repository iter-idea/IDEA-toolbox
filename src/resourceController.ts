/**
 * RESOURCE CONTROLLER
 */

import { DynamoDB } from './dynamoDB';
import { Cognito } from './cognito';
import { APIGateway} from './apiGateway';
import { S3 } from './s3';
import { SES } from './ses';
import { SNS } from './sns';
import { Utils } from './utils';

export abstract class ResourceController {
  protected callback: any;

  protected claims: any;
  protected principalId: string;

  protected httpMethod: string;
  protected body: any;
  protected queryParams: any;
  protected resourceId: string;
  
  protected project: string;
  protected tables: any;

  protected _dynamoDB: DynamoDB;
  protected _cognito: Cognito;
  protected _apiGateway: APIGateway;
  protected _s3: S3;
  protected _ses: SES;
  protected _sns: SNS;
  protected _utils: Utils;
  
  /**
   * @param event the event that invoked the AWS lambda function
   * @param callback the callback to resolve or reject the execution
   * @param project the name of the project
   * @param tables optional; the DynamoDB tables involved
   */
  constructor(event: any, callback: any, project: string, tables?: string) {
    this.utils.logger('START', null, event, true);

    this.callback = callback;
    
    this.claims = event.requestContext.authorizer ? event.requestContext.authorizer.claims : null;
    this.principalId = this.claims ? this.claims.sub : null;
    
    this.httpMethod = event.httpMethod;
    this.resourceId = event.pathParameters && event.pathParameters.proxy
      ? decodeURIComponent(event.pathParameters.proxy) : '';
    this.queryParams = event.queryStringParameters || {};
    this.body = JSON.parse(event.body) || {};
    
    this.project = project;

    this.tables = tables; 
  }

///
/// REQUEST HANDLERS
///

  public handleRequest = (): void => {
    // check the authorizations and prepare the API request
    this.checkAuthBeforeRequest()
    .then(() => {
      let request;
      if(this.resourceId) switch(this.httpMethod) {
        // resource/{resourceId}
        case 'GET': request = this.getResource(); break;
        case 'POST': request = this.postResource(); break;
        case 'PUT': request = this.putResource(); break;
        case 'DELETE': request = this.deleteResource(); break;
        case 'HEAD': request = this.headResource(); break;
        default: /* nope */;
      } else switch(this.httpMethod) {
        // resource
        case 'GET': request = this.getResources(); break;
        case 'POST': request = this.postResources(); break;
        case 'PUT': request = this.putResources(); break;
        case 'DELETE': request = this.deleteResources(); break;
        case 'HEAD': request = this.headResources(); break;
        default: /* nope */;
      }
      // execute the API request
      if(!request) this.done(new Error(`E.COMMON.UNSUPPORTED_ACTION`));
      else {
        this.utils.logger('REQUEST', null, this.httpMethod, true);
        request
        .then((res: any) => this.done(null, res))
        .catch((err: Error) => this.done(err));
      }
    })
    .catch(() => this.done(new Error(`E.COMMON.UNAUTHORIZED`)));
  }
  /**
   * To @override
   */
  protected checkAuthBeforeRequest(): Promise<void> {
    return new Promise(resolve => resolve());
  };
  /**
   * Default callback for IDEA's API resource controllers.
   * @param {Error} err if not null, it contains the error raised
   * @param {any} res if err, the error string, otherwise the result (a JSON to parse)
   */
  protected done(err: Error, res?: any): any {
    this.utils.logger(`DONE`, err, res, true);
    this.callback(null, {
      statusCode: err ? '400' : '200',
      body: err ?  JSON.stringify(err.message) : JSON.stringify(res),
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    })
  }
  /**
   * To @override
   * Valide the object's attributes, performing all the checkings.
   * _Note_: when updating this function, also update the one in the front-end.
   * @param {any} o the object
   * @return {Array<string>} errors
   */
  protected validateResource(o: any): Array<string> {
    this.utils.logger('RESOURCE VALIDATION', null, JSON.stringify(o));
    return [];
  }
  /**
   * To @override
   */
  protected getResource(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected postResource(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected putResource(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected deleteResource(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected headResource(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected getResources(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected postResources(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected putResources(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected deleteResources(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
  /**
   * To @override
   */
  protected headResources(): Promise<any> {
    return new Promise((resolve, reject) => reject(new Error(`E.COMMON.UNSUPPORTED_ACTION`)));
  };
 
///
/// AWS SERVICES AND UTILS
///
  get dynamoDB(): DynamoDB {
    if(!this._dynamoDB) this._dynamoDB = new DynamoDB(this.project, this.tables, this.utils);
    return this._dynamoDB;
  }
  set dynamoDB(dynamoDB: DynamoDB) {
    this._dynamoDB = dynamoDB;
  }
  get cognito(): Cognito {
    if(!this._cognito) this._cognito = new Cognito(this.claims);
    return this._cognito;
  }
  set cognito(cognito: Cognito) {
    this._cognito = cognito;
  }
  get apiGateway(): APIGateway {
    if(!this._apiGateway) this._apiGateway = new APIGateway(this.utils);
    return this._apiGateway;
  }
  set apiGateway(apiGateway: APIGateway) {
    this._apiGateway = apiGateway;
  }
  get s3(): S3 {
    if(!this._s3) this._s3 = new S3(this.utils);
    return this._s3;
  }
  set s3(s3: S3) {
    this._s3 = s3;
  }
  get ses(): SES {
    if(!this._ses) this._ses = new SES(this.utils);
    return this._ses;
  }
  set ses(ses: SES) {
    this._ses = ses;
  }
  get sns(): SNS {
    if(!this._sns) this._sns = new SNS(this.utils);
    return this._sns;
  }
  set sns(sns: SNS) {
    this._sns = sns;
  }
  get utils(): Utils {
    if(!this._utils) this._utils = new Utils();
    return this._utils;
  }
  set utils(utils: Utils) {
    this._utils = utils;
  }
}