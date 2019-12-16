/**
 * Interface to extend that represents the active modules for a team in a certain project.
 */
export interface TeamModules {
  /**
   * For each module, if it is active or not for the team.
   */
  [key: string]: boolean;
}
