import { Resource } from './resource.model';

export class Announcement extends Resource {
  /**
   * The content of the announcement.
   */
  content: string;
  /**
   * Whether it's a maintenance announcement; if so, the use of the service is temporarily blocked.
   */
  maintenance?: boolean;

  load(x: any) {
    super.load(x);
    this.content = this.clean(x.content, String);
    if (x.maintenance) this.maintenance = true;
  }
}
