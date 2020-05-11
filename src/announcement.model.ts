import { Resource } from './resource.model';

export class Announcement extends Resource {
  /**
   * The content of the announcement.
   */
  public content: string;
  /**
   * Whether it's a maintenance announcement; if so, the use of the service is temporarily blocked.
   */
  public maintenance?: boolean;

  public load(x: any) {
    super.load(x);
    this.content = this.clean(x.content, String);
    if (x.maintenance) this.maintenance = true;
  }
}
