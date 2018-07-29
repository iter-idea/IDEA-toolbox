import AWS = require('aws-sdk');

/**
 * A wrapper for AWS Cognito.
 */
export class Cognito {
  protected claims: any;

  /**
   * Initialize a new Cognito helper object.
   * @param {InitOptions} options
   */
  constructor(options?: InitOptionsCognito) {
    this.claims = options.claims || {};
  }

  /**
   * Get the attributes of the user, from the authorizer claims.
   * @return {any | null} user's data
   */
  public getUserByClaims(): any | null {
    if(!this.claims) return null;
    let user: any = {};
    // add any additional cognito attribute available in cognito
    for(let p in this.claims) if(p.startsWith('cognito:')) user[p.slice(8)] = this.claims[p];
    // map the important attributes with reserved names
    user.userId = this.claims.sub;
    user.email = this.claims.email;
    user.name = this.claims.name;
    user.phoneNumber = this.claims.phone_number;
    return user;
  }

  /**
   * Identify a user by its email address, returning its attributes.
   * @param {string} email user's email
   * @param {string} cognitoUserPoolId the pool in which to search
   * @return {Promise<any>}
   */
  public getUserByEmail(email: string, cognitoUserPoolId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // find the user by the email
      new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })
      .listUsers({ UserPoolId: cognitoUserPoolId, Filter: `email = "${email}"`, Limit: 1},
      (err: Error, data: any) => {
        if(err || !data || !data.Users || !data.Users[0]) reject();
        else {
          // convert and return the attributes
          let userAttributes: any = {};
          data.Users[0].Attributes.forEach((a: any) => userAttributes[a.Name] = a.Value);
          resolve(userAttributes);
        }
      });
    });
  }

  /**
   * Identify a user by its sub, returning its attributes.
   * @param {string} sub user's sub (userId)
   * @param {string} cognitoUserPoolId the pool in which to search
   * @return {Promise<any>}
   */
  public getUserBySub(sub: string, cognitoUserPoolId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // find the user by the sub
      new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })
      .listUsers({ UserPoolId: cognitoUserPoolId, Filter: `sub = "${sub}"`, Limit: 1},
      (err: Error, data: any) => {
        if(err || !data || !data.Users || !data.Users[0]) reject();
        else {
          // convert and return the attributes
          let userAttributes: any = {};
          data.Users[0].Attributes.forEach((a: any) => userAttributes[a.Name] = a.Value);
          resolve(userAttributes);
        }
      });
    });
  }
}

/**
 * The initial options for a constructor of class Cognito.
 */
export interface InitOptionsCognito {
  /**
   * The claims of the API request
   */
  claims?: any;
}