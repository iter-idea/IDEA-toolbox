import { epochISOString } from './epoch';
import { Resource } from './resource.model';

/**
 * A user stored in a Auth0 User Pool.
 */
export class Auth0User extends Resource {
  /**
   * The ID of the user (sub).
   */
  userId: string;
  /**
   * The email address of the user.
   */
  email: string;
  /**
   * Whether the email address of the user is verified.
   */
  emailVerified: boolean;
  /**
   * The fullname of the user.
   */
  name: string;
  /**
   * The nickname of the user.
   */
  nickname: string;
  /**
   * The URI or URL to the user's picture.
   */
  picture: string;
  /**
   * The timestamp of last update of the user.
   */
  updatedAt: epochISOString;

  /**
   * The list of groups the user is part of.
   */
  groups: string[];
  /**
   * The user's custom attributes.
   */
  attributes: { [attribute: string]: any };
  /**
   * The user's custom preferences.
   */
  preferences: { [preference: string]: any };

  load(x: any): void {
    this.userId = this.clean(x.userId || x.sub, String);
    this.email = this.clean(x.email, String);
    this.emailVerified = this.clean(x.emailVerified || x.email_verified, Boolean);
    this.name = this.clean(x.name, String);
    this.nickname = this.clean(x.nickname, String);
    this.picture = this.clean(x.picture, String);
    this.updatedAt = this.clean(x.updatedAt || x.updated_at, t => new Date(t).toISOString());

    this.groups = this.cleanArray(x.groups, String);
    this.attributes = x.attributes ?? {};
    this.preferences = x.preferences ?? {};
  }

  /**
   * Check whether the user's attributes are valid.
   */
  validate(): string[] {
    const e: string[] = [];
    if (this.iE(this.email, 'email')) e.push('email');
    if (this.iE(this.name)) e.push('name');
    return e;
  }

  /**
   * Whether the user is part of the administrators group.
   */
  isAdmin = (): boolean => this.groups.includes('admins');
  /**
   * Whether the user is part of the robots group.
   */
  isRobot = (): boolean => this.groups.includes('robots');
}
