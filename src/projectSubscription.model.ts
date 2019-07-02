import { Resource } from './resource.model';
import { Label } from './label.model';

/**
 * Expressed in months (WEEK is an exception, with value 0).
 */
export enum SubscriptionDurations {
  WEEK = 0, MONTH_1 = 1, MONTH_2 = 2, MONTH_3 = 3, MONTH_6 = 6, YEAR_1 = 12, LIFETIME = 9999
}

export enum SubscriptionPlatforms {
  WEB = 'web', IOS = 'ios', ANDROID = 'android', MACOS = 'macos', WINDOWS = 'windows'
}

/**
 * Table: `idea_projects_subscriptions`.
 *
 * Indexes:
 *   - `project-order-index` (LSI, all).
 */
export class ProjectSubscription extends Resource  {
  /**
   * Project / product key.
   */
  public project: string;
  /**
   * The id of the project subscription.
   */
  public subscriptionId: string;
  /**
   * The id of the subscription in the stores (aka Product ID).
   */
  public storeId: string;
  /**
   * The price, based on the currency set.
   */
  public price: number;
  /**
   * The currency ISO code: EUR, USD, etc.
   */
  public currency: string;
  /**
   * The subscription duration.
   */
  public duration: SubscriptionDurations;
  /**
   * The platforms in which the subscription is enabled (and therefore visible).
   */
  public platforms: Array<SubscriptionPlatforms>;
  /**
   * The title of the subscription, in various languages.
   */
  public title: Label;
  /**
   * The description of the subscription, in various languages.
   */
  public description: Label;
  /**
   * Order with which to sort the subscriptions when shown.
   */
  public order: number;
  /**
   * If true, the subscription is an anomaly and it needs to be threaded in special ways.
   */
  public special: boolean;

  constructor(availableLanguages?: Array<string>) {
    super();
    this.project = null;
    this.subscriptionId = null;
    this.storeId = null;
    this.price = null;
    this.currency = 'EUR';
    this.duration = SubscriptionDurations.MONTH_1;
    this.platforms = [SubscriptionPlatforms.WEB];
    this.title = <Label> {};
    availableLanguages.forEach(l => this.title[l] = null);
    this.description = <Label> {};
    availableLanguages.forEach(l => this.description[l] = null);
    this.order = 0;
    this.special = false;
  }

  public load(x: any, availableLanguages?: Array<string>) {
    super.load(x);
    this.project = x.project ? String(x.project) : null;
    this.subscriptionId = x.subscriptionId ? String(x.subscriptionId) : null;
    this.storeId = x.storeId ? String(x.storeId) : null;
    this.price = x.price ? Number(x.price) : null;
    this.currency = x.currency ? String(x.currency) : 'EUR';
    this.duration = x.duration ? <SubscriptionDurations>Number(x.duration) : SubscriptionDurations.MONTH_1;
    this.platforms = x.platforms ? x.platforms
      .map((p: string) => p ? <SubscriptionPlatforms>String(p) : null) : [SubscriptionPlatforms.WEB];
    this.title = <Label> {};
    availableLanguages.forEach(l => this.title[l] = x.title[l] ? String(x.title[l]) : null);
    this.description = <Label> {};
    availableLanguages.forEach(l => this.description[l] = x.description[l] ? String(x.description[l]) : null);
    this.order = x.order ? Number(x.order) : 0;
    this.special = Boolean(x.special);
  }

  public safeLoad(_: any, safeData: any, availableLanguages?: Array<string>) {
    this.load(safeData, availableLanguages);
    this.project = safeData.project;
    this.subscriptionId = safeData.subscriptionId;
    this.special = safeData.special;
  }

  public validate(defaultLanguage?: string): Array<string> {
    const e = super.validate();
    //
    if (this.iE(defaultLanguage)) e.push('defaultLanguage');
    //
    if (this.iE(this.storeId)) e.push('storeId');
    if (this.iE(this.price)) e.push('price');
    if (this.iE(this.currency)) e.push('currency');
    if (!(this.duration in SubscriptionDurations)) e.push('duration');
    if (!this.platforms.length) e.push('platforms');
    this.platforms.forEach(p => {
      if (!(p in SubscriptionPlatforms)) e.push('platforms');
    });
    if (this.iE(this.title[defaultLanguage])) e.push('name');
    //
    return e;
  }
}
