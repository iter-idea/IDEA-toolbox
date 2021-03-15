import { epochISOString } from './epoch';
import { Resource } from './resource.model';

/**
 * A whitelisted error for a project, i.e. an error to ignore during the reporting for a specific project.
 *
 * Table: `idea_projects_errorsWhitelisted`.
 */
export class ErrorWhitelisted extends Resource {
  /**
   * Project/product key.
   */
  public project: string;
  /**
   * The error message.
   */
  public error: string;
  /**
   * Timestamp when the error was whitelisted.
   */
  public createdAt: epochISOString;
  /**
   * Some notes or an explanation why the error is whitelisted.
   */
  public notes: string;

  public load(x: any) {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.error = this.clean(x.error, String);
    this.createdAt = this.clean(x.createdAt, t => new Date(t).toISOString()) as epochISOString;
    this.notes = this.clean(x.notes, String);
  }
}
