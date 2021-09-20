import { Resource } from './resource.model';

/**
 * A Resource Center's folder configured in other Objects.
 */
export class RCConfiguredFolder extends Resource {
  /**
   * The id of the folder.
   */
  folderId: string;
  /**
   * The name of the folder.
   */
  name: string;

  load(x: any) {
    super.load(x);
    this.folderId = this.clean(x.folderId, String);
    this.name = this.clean(x.name, String);
  }

  safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.folderId = safeData.folderId;
    this.name = safeData.folderId;
  }

  validate(): string[] {
    const e = super.validate();
    if (this.iE(this.name)) e.push('name');
    return e;
  }
}
