import { isEmpty } from './utils';

/**
 * A user stored in a Cognito User Pool.
 */
export class CognitoUser {
  /**
   * The id of the user.
   */
  userId: string;
  /**
   * The email address of the user.
   */
  email: string;
  /**
   * The fullname of the user.
   */
  name: string;
  /**
   * The list of groups containing the user.
   */
  groups: string[];
  /**
   * The user's (custom) attributes.
   */
  attributes: { [attribute: string]: string | number };

  constructor(x: any = {}) {
    this.userId = x.userId || x.sub;
    this.email = x.email;
    this.name = x.name;
    this.groups = x.groups || this.parseGroupsFromClaims(x['cognito:groups']);
    if (x.attributes) this.attributes = x.attributes;
    else {
      this.attributes = {};
      Object.keys(x)
        .filter(a => a.startsWith('custom:'))
        .forEach(a => (this.attributes[a.slice('custom:'.length)] = x[a]));
    }
  }
  // the groups claim can come in many forms, depending on the input payload type and version.
  private parseGroupsFromClaims(groupsClaim: string | string[]): string[] {
    if (!groupsClaim) return [];
    // ['myGroup1', 'myGroup2']
    if (Array.isArray(groupsClaim)) return groupsClaim;
    // '[myGroup1 myGroup2]'
    if (groupsClaim.startsWith('[')) return groupsClaim.slice(1, groupsClaim.length - 1).split(' ');
    // 'myGroup1, myGroup2'
    else return groupsClaim.split(',');
  }

  /**
   * Check whether the user's attributes are valid.
   */
  validate(): string[] {
    const e: string[] = [];
    if (isEmpty(this.name)) e.push('name');
    if (isEmpty(this.email, 'email')) e.push('email');
    return e;
  }

  /**
   * Whether the user is part of the administrators group.
   */
  isAdmin(): boolean {
    return this.groups.includes('admins');
  }
  /**
   * Whether the user is part of the robots group.
   */
  isRobot(): boolean {
    return this.groups.includes('robots');
  }
}
