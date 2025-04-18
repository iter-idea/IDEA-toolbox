import { Resource } from './resource.model';
import { ISOString } from './epoch';
import { toISOString } from './utils';

/**
 * A whitelisted error for a project, i.e. an error to ignore during the reporting for a specific project.
 *
 * Table: `idea_projects_errorsWhitelisted`.
 */
export class ErrorWhitelisted extends Resource {
  /**
   * Project/product key.
   */
  project: string;
  /**
   * The error message.
   */
  error: string;
  /**
   * Timestamp when the error was whitelisted.
   */
  createdAt: ISOString;
  /**
   * Some notes or an explanation why the error is whitelisted.
   */
  notes: string;

  load(x: any): void {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.error = this.clean(x.error, String);
    this.createdAt = this.clean(x.createdAt, toISOString);
    this.notes = this.clean(x.notes, String);
  }
}
