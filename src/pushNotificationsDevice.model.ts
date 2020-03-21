import { Resource } from './resource.model';
import { PushNotificationsPlatforms } from './pushNotificationsPlatforms.enum';

/**
 * Devices for push notifications.
 */
export class PushDevice extends Resource {
  /**
   * The device identification token (also known as device ID or registration ID).
   */
  public token: string;
  /**
   * The device's platform.
   */
  public platform: PushNotificationsPlatforms;
  /**
   * The device's endpoint.
   */
  public endpoint: string;

  public load(x: any) {
    super.load(x);
    this.token = this.clean(x.token, String);
    this.platform = this.clean(x.platform, String);
    this.endpoint = this.clean(x.endpoint, String);
  }

  public validate(complete?: boolean): Array<string> {
    const e = super.validate();
    if (this.iE(this.token)) e.push(`token`);
    if (!(this.platform in PushNotificationsPlatforms)) e.push(`platform`);
    if (complete) {
      if (this.iE(this.endpoint)) e.push(`endpoint`);
    }
    return e;
  }
}
