import { Resource } from './resource.model';
import { loopStringEnumValues } from './utils';

/**
 * Structure representing language preferences in a context.
 */
export class Languages extends Resource {
  /**
   * The default language for a context.
   */
  default: ServiceLanguages | string;
  /**
   * The available languages available in a context.
   */
  available: (ServiceLanguages | string)[];

  load(x: any): void {
    super.load(x);
    this.default = this.clean(x.default, String, ServiceLanguages.English);
    this.available = this.cleanArray(x.available, String, [ServiceLanguages.English]);
  }

  validate(languagesOfSpecificService: any): string[] {
    const e = super.validate();
    if (!this.default || !this.available.some(x => x === this.default)) e.push('default');
    if (!this.available.every(l => loopStringEnumValues(languagesOfSpecificService).some(x => x === l)))
      e.push('available');
    return e;
  }
}

/**
 * The languages available in a specific service. It must be redefined in every service.
 */
export enum ServiceLanguages {
  English = 'en'
}
