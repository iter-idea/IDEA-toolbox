import { Resource } from './resource.model';

/**
 * A user stored in a Cognito User Pool.
 */
export class CognitoUser extends Resource {
  /**
   * The id of the user.
   */
  userId: string;
  /**
   * The fullname of the user.
   */
  name: string;
  /**
   * The email address of the user.
   */
  email: string;
  /**
   * The list of groups containing the user.
   */
  groups: string[];

  /**
   * Load the attributes from an already existing resource.
   * Note: the method also reads from the user's token (claims) format.
   */
  load(x: any) {
    super.load(x);
    this.userId = this.clean(x.userId || x.sub, String);
    this.name = this.clean(x.name, String);
    this.email = this.clean(x.email, String);
    this.groups = this.cleanArray(x.groups || x['cognito:groups']?.split(','), String);
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    if (this.iE(this.email)) e.push('email');
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
