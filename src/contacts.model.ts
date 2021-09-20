import { Resource } from './resource.model';

export class Contacts extends Resource {
  /**
   * Contact person's phone.
   */
  phone?: string;
  /**
   * Contact person's email.
   */
  email?: string;
  /**
   * Fullname/nickname.
   */
  name?: string;

  load(x: any) {
    super.load(x);
    if (x.phone) this.phone = this.clean(x.phone, String);
    if (x.email) this.email = this.clean(x.email, String);
    if (x.name) this.name = this.clean(x.name, String);
  }

  validate(): string[] {
    const e = super.validate();
    if (this.phone && this.iE(this.phone, 'phone')) e.push('phone');
    if (this.email && this.iE(this.email, 'email')) e.push('email');
    return e;
  }
}
