import { Resource } from './resource.model';

/**
 * A Resource Center's folder configured in other Objects.
 */
export class RCConfiguredFolder extends Resource {
  /**
   * The id of the folder.
   */
  public folderId: string;
  /**
   * The name of the folder.
   */
  public name: string;

  constructor(x?: RCConfiguredFolder | any) {
    super();
    this.folderId = null;
    this.name = null;
    if (x) this.load(x);
  }

  public load(x: any) {
    super.load(x);
    this.folderId = x.folderId ? String(x.folderId) : null;
    this.name = x.name ? String(x.name) : null;
  }

  public safeLoad(newData: any, safeData: any) {
    super.safeLoad(newData, safeData);
    this.folderId = safeData.folderId;
    this.name = safeData.folderId;
  }

  public validate(): Array<string> {
    const e = super.validate();
    if (this.iE(this.name)) e.push(`name`);
    return e;
  }
}
