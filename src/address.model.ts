import { Resource } from './resource.model';
import { Countries } from './countries.enum';

export class Address extends Resource {
  /**
   * Main address or company name.
   */
  address: string;
  /**
   * Apartment, suite, unit, building, floor, etc.
   */
  address2?: string;
  /**
   * Postal code/zip code.
   */
  postcode: string;
  /**
   * Town/city.
   */
  city: string;
  /**
   * Province, district, area.
   */
  province: string;
  /**
   * Country.
   */
  country: Countries;
  /**
   * The geolocation, expressed in latitute and longitude.
   */
  geolocation?: AddressGeolocation;
  /**
   * Contact person / receiver.
   */
  contact?: string;
  /**
   * Contact person's phone.
   */
  phone?: string;
  /**
   * Contact person's email.
   */
  email?: string;

  load(x: any) {
    super.load(x);
    this.address = this.clean(x.address, String);
    if (x.address2) this.address2 = this.clean(x.address2, String);
    this.postcode = this.clean(x.postcode, String);
    this.city = this.clean(x.city, String);
    this.province = this.clean(x.province, String);
    this.country = this.clean(x.country, String);
    if (x.geolocation) this.geolocation = new AddressGeolocation(x.geolocation);
    if (x.contact) this.contact = this.clean(x.contact, String);
    if (x.phone) this.phone = this.clean(x.phone, String);
    if (x.email) this.email = this.clean(x.email, String);
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.address)) e.push('address');
    if (this.iE(this.city)) e.push('city');
    if (!(this.country in Countries)) e.push('country');
    if (this.phone && this.iE(this.phone, 'phone')) e.push('phone');
    if (this.email && this.iE(this.email, 'email')) e.push('email');
    return e;
  }

  /**
   * Get a string representing the formatted full address.
   */
  getFullAddress(
    display: {
      address?: boolean;
      address2?: boolean;
      city?: boolean;
      postcode?: boolean;
      province?: boolean;
      country?: boolean;
    } = {}
  ) {
    display = Object.assign(
      {
        address: true,
        address2: true,
        city: true,
        postcode: true,
        province: true,
        country: true
      },
      display
    );
    let res = '';

    if (this.address?.trim() && display.address) res = res.concat(this.address.trim());
    if (this.address2?.trim() && display.address2) {
      if (res.length) res = res.concat(` (${this.address2.trim()})`);
      else res = res.concat(this.address2.trim());
    }

    if (this.city?.trim() && display.city) {
      if (res.length) res = res.concat(`, ${this.city.trim()}`);
      else res = res.concat(this.city.trim());
    }
    if (this.postcode?.trim() && display.postcode) {
      if (this.city?.trim() && display.city) res = res.concat(` ${this.postcode.trim()}`);
      else if (res.length) res = res.concat(`, ${this.postcode.trim()}`);
      else res = res.concat(this.postcode.trim());
    }
    if (this.province?.trim() && display.province) {
      if (res.length) res = res.concat(` (${this.province.trim()})`);
      else res = res.concat(this.province.trim());
    }

    if (this.country?.trim() && display.country) {
      if (res.length) res = res.concat(` - ${this.country.trim()}`);
      else res = res.concat(this.country.trim());
    }

    return res.trim();
  }
}

/**
 * An address' geolocation expressed in latitute and longitude.
 */
export class AddressGeolocation extends Resource {
  /**
   * Latitude.
   */
  lat: number;
  /**
   * Longitude.
   */
  lng: number;

  load(x: any) {
    super.load(x);
    this.lat = this.clean(x.lat, Number);
    this.lng = this.clean(x.lng, Number);
  }
}
