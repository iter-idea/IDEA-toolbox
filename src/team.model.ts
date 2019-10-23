import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * Table: `idea_teams`.
 */
export class Team extends Resource {
  /**
   * The id of the team
   */
  public teamId: string;
  /**
   * The team name.
   */
  public name: string;
  /**
   * The id of the owner.
   */
  public ownerId: string;
  /**
   * Timestamp of creation.
   */
  public createdAt: epochDateTime;

  public load(x: any) {
    super.load(x);
    this.teamId = this.clean(x.teamId, String);
    this.name = this.clean(x.name, String);
    this.ownerId = this.clean(x.ownerId, String);
    this.createdAt = this.clean(x.createdAt, d => new Date(d).getTime(), Date.now());
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.teamId = safeData.teamId;
    this.ownerId = safeData.ownerId;
    this.createdAt = safeData.createdAt;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.name)) e.push(`name`);
    return e;
  }
}
