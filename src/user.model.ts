import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * Table: `idea_users`.
 */
export class User extends Resource {
  /**
   * Cognito sub.
   */
  public userId: string;
  /**
   * === username (from Cognito, **not in DynamoDB**).
   */
  public email: string;
  /**
   * The currently selected team in each project.
   */
  protected currentTeamInProjects: { [project: string]: string };
  /**
   * Timestamp of creation.
   */
  public createdAt: epochDateTime;

  // @todo kept for retrocompatibility before `IDEA Ionic Extra v5.15.x` #22
  //  --> when all the projects are advanced to that version, you can remove this attribute
  /**
   * @deprecated
   */
  public currentTeam: any;

  public load(x: any) {
    super.load(x);
    this.userId = this.clean(x.userId, String);
    this.email = this.clean(x.email, String);
    this.currentTeamInProjects = {};
    if (x.currentTeamInProjects)
      for (const project of Object.keys(x.currentTeamInProjects))
        if (x.currentTeamInProjects[project])
          this.currentTeamInProjects[project] = String(x.currentTeamInProjects[project]);
    this.createdAt = this.clean(x.createdAt, d => new Date(d).getTime(), Date.now());

    // @todo kept for retrocompatibility before `IDEA Ionic Extra v5.15.x` #22
    //  --> when all the projects are advanced to that version, you can remove this attribute
    this.currentTeam = {};
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    delete this.email; // stored only in Cognito
    this.userId = safeData.userId;
    this.currentTeamInProjects = safeData.currentTeamInProjects;
    this.createdAt = safeData.createdAt;

    // @todo kept for retrocompatibility before `IDEA Ionic Extra v5.15.x` #22
    //  --> when all the projects are advanced to that version, you can remove this attribute
    this.currentTeam = {};
  }

  /**
   * Get the current team for the user in the selected project.
   */
  public getCurrentTeamOfProject(project: string): string {
    return this.currentTeamInProjects[project] || null;
  }
  /**
   * Set (or reset) the current team for the user in the selected project.
   */
  public setCurrentTeamOfProject(project: string, teamId?: string) {
    if (teamId) this.currentTeamInProjects[project] = String(teamId);
    else delete this.currentTeamInProjects[project];
  }
}
