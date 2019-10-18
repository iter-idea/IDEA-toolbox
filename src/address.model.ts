import { Resource } from './resource.model';
import { Countries } from './countries.enum';

export class Address extends Resource {
  /**
   * Main address or company name.
   */
  public address: string;
  /**
   * Apartment, suite, unit, building, floor, etc.
   */
  public address2?: string;
  /**
   * Town/city.
   */
  public city: string;
  /**
   * Postal code/zip code.
   */
  public postcode: string;
  /**
   * Country.
   */
  public country: Countries;
  /**
   * Contact person / receiver.
   */
  public contact?: string;
  /**
   * Contact person's phone.
   */
  public phone?: string;
  /**
   * Contact person's email.
   */
  public email?: string;
  /**
   * Concatenation of all the address fields.
   */
  public fullAddress: string;

  public load(x: any) {
    super.load(x);
    this.address = this.clean(x.address, String);
    if (x.address2) this.address2 = this.clean(x.address2, String);
    this.city = this.clean(x.city, String);
    this.postcode = this.clean(x.postcode, String);
    this.country = this.clean(x.country, String);
    if (x.contact) this.contact = this.clean(x.contact, String);
    if (x.phone) this.phone = this.clean(x.phone, String);
    if (x.email) this.email = this.clean(x.email, String);
    this.fullAddress = this.getFullAddress();
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.address)) e.push('address');
    if (this.iE(this.city)) e.push('city');
    if (!(this.country in Countries)) e.push('country');
    if (this.phone && this.iE(this.phone, 'phone')) e.push('phone');
    if (this.email && this.iE(this.email, 'email')) e.push('email');
    return e;
  }

  public getFullAddress() {
    let full = this.address || '';
    if (this.address2) full = full.concat(` (${this.address2})`);
    if (this.city || this.postcode) full = full.concat(`, ${this.city} ${this.postcode}`.trim());
    if (this.country) full = full.concat(` - ${this.country}`);
    return full.trim();
  }
}
