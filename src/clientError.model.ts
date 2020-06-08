import { Resource } from './resource.model';

export class ClientError extends Resource {
  /**
   * The name of the error.
   */
  public name: string;
  /**
   * The error message.
   */
  public message: string;
  /**
   * The error stack (stringified).
   */
  public stack: string;

  public load(x: any) {
    super.load(x);
    this.name = this.clean(x.name, String);
    this.message = this.clean(x.message, String);
    this.stack = this.clean(x.stack, String);
  }
}
