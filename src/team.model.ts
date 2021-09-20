import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * Table: `idea_teams`.
 */
export class Team extends Resource {
  /**
   * The id of the team
   */
  teamId: string;
  /**
   * The team name.
   */
  name: string;
  /**
   * Timestamp of creation.
   */
  createdAt: epochDateTime;
  /**
   * The list of projects (codes) in which the team is currently active.
   */
  activeInProjects: string[];

  load(x: any) {
    super.load(x);
    this.teamId = this.clean(x.teamId, String);
    this.name = this.clean(x.name, String);
    this.createdAt = this.clean(x.createdAt, d => new Date(d).getTime(), Date.now());
    this.activeInProjects = this.cleanArray(x.activeInProjects, String);
  }

  safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.teamId = safeData.teamId;
    this.createdAt = safeData.createdAt;
    this.activeInProjects = safeData.activeInProjects;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    return e;
  }
}
