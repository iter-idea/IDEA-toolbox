import { markdown } from './markdown';
import { Resource } from './resource.model';

/**
 * The status related to an app's version.
 */
export class AppStatus extends Resource {
  /**
   * The version that generated the status.
   */
  version: string;
  /**
   * Whether the app is in maintenance mode.
   */
  inMaintenance: boolean;
  /**
   * Whether the app must be updated.
   */
  mustUpdate: boolean;
  /**
   * The status-related content to display (markdown).
   */
  content: markdown;
  /**
   * The latest version of the app.
   */
  latestVersion: string;

  load(x: any): void {
    super.load(x);
    this.version = this.clean(x.version, String);
    this.inMaintenance = this.clean(x.inMaintenance, Boolean);
    this.mustUpdate = this.clean(x.mustUpdate, Boolean);
    this.content = this.clean(x.content, String);
    this.latestVersion = this.clean(x.latestVersion, String);
  }
}

/**
 * The internal information about the status of an app's version.
 * @deprecated prefer the new method via asset (vs via API).
 */
export interface InternalAppVersionStatus {
  /**
   * The targeted app version.
   */
  version: string;
  /**
   * The message to display reated to this version, if any.
   */
  message?: string;
}
