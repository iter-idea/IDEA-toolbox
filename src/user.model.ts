import { Resource } from './resource.model';
import { epochDateTime } from './epoch';

/**
 * Table: `idea_users`.
 */
export class User extends Resource {
  /**
   * Cognito sub.
   */
  userId: string;
  /**
   * === username (from Cognito, **not in DynamoDB**).
   */
  email: string;
  /**
   * The currently selected team in each project.
   */
  protected currentTeamInProjects: { [project: string]: string };
  /**
   * Timestamp of creation.
   */
  createdAt: epochDateTime;

  load(x: any): void {
    super.load(x);
    this.userId = this.clean(x.userId, String);
    this.email = this.clean(x.email, String);
    this.currentTeamInProjects = {};
    if (x.currentTeamInProjects)
      for (const project of Object.keys(x.currentTeamInProjects))
        if (x.currentTeamInProjects[project])
          this.currentTeamInProjects[project] = String(x.currentTeamInProjects[project]);
    this.createdAt = this.clean(x.createdAt, d => new Date(d).getTime(), Date.now());
  }

  safeLoad(newData: any, safeData: any): void {
    super.safeLoad(newData, safeData);
    delete this.email; // stored only in Cognito
    this.userId = safeData.userId;
    this.currentTeamInProjects = safeData.currentTeamInProjects;
    this.createdAt = safeData.createdAt;
  }

  /**
   * Get the current team for the user in the selected project.
   */
  getCurrentTeamOfProject(project: string): string {
    return this.currentTeamInProjects[project] || null;
  }
  /**
   * Set (or reset) the current team for the user in the selected project.
   */
  setCurrentTeamOfProject(project: string, teamId?: string): void {
    if (teamId) this.currentTeamInProjects[project] = String(teamId);
    else delete this.currentTeamInProjects[project];
  }
}
