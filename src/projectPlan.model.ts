import { Resource } from './resource.model';
import { Label } from './label.model';

/**
 * Expressed in months (WEEK is an exception, with value 0).
 */
export enum ProjectPlanDurations {
  WEEK = 0, MONTH_1 = 1, MONTH_2 = 2, MONTH_3 = 3, MONTH_6 = 6, YEAR_1 = 12, LIFETIME = 9999
}

export enum ProjectPlatforms {
  WEB = 'web', IOS = 'ios', ANDROID = 'android', MACOS = 'macos', WINDOWS = 'windows'
}

/**
 * Table: `idea_projects_plans`.
 *
 * Indexes:
 *   - `project-order-index` (LSI, all).
 */
export class ProjectPlan extends Resource  {
  /**
   * Project / product key.
   */
  public project: string;
  /**
   * The id of the project plan.
   */
  public planId: string;
  /**
   * The id of the plan in the stores (aka Product ID).
   */
  public storePlanId: string;
  /**
   * The price, based on the currency set.
   */
  public price: number;
  /**
   * The currency ISO code: EUR, USD, etc.
   */
  public currency: string;
  /**
   * The currency symbol: €, $, etc.
   */
  public currencySymbol: string;
  /**
   * The string version of the price, with the currency symbol concatenated.
   */
  public priceStr: string;
  /**
   * The plan duration.
   */
  public duration: ProjectPlanDurations;
  /**
   * The platforms in which the plan is enabled (and therefore visible).
   */
  public platforms: Array<ProjectPlatforms>;
  /**
   * The title of the plan, in various languages.
   */
  public title: Label;
  /**
   * The description of the plan, in various languages.
   */
  public description: Label;
  /**
   * Order with which to sort the plan when shown.
   */
  public order: number;
  /**
   * If true, the plan is an anomaly and it needs to be threaded in special ways.
   */
  public special: boolean;

  constructor(availableLanguages?: Array<string>) {
    super();
    this.project = null;
    this.planId = null;
    this.storePlanId = null;
    this.price = null;
    this.currency = 'EUR';
    this.currencySymbol = '€';
    this.priceStr = null;
    this.duration = ProjectPlanDurations.MONTH_1;
    this.platforms = [ProjectPlatforms.WEB];
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
    this.planId = x.planId ? String(x.planId) : null;
    this.storePlanId = x.storePlanId ? String(x.storePlanId) : null;
    this.price = x.price ? Number(x.price) : null;
    this.currency = x.currency ? String(x.currency) : 'EUR';
    this.currencySymbol = x.currencySymbol ? String(x.currencySymbol) : '€';
    this.priceStr = x.priceStr ? String(x.priceStr) : null;
    this.duration = x.duration ? <ProjectPlanDurations>Number(x.duration) : ProjectPlanDurations.MONTH_1;
    this.platforms = x.platforms ? x.platforms
      .map((p: string) => p ? <ProjectPlatforms>String(p) : null) : [ProjectPlatforms.WEB];
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
    this.planId = safeData.planId;
    this.special = safeData.special;
  }

  public validate(defaultLanguage?: string): Array<string> {
    const e = super.validate();
    //
    if (this.iE(defaultLanguage)) e.push('defaultLanguage');
    //
    if (this.iE(this.storePlanId)) e.push('storePlanId');
    if (this.iE(this.price)) e.push('price');
    if (this.iE(this.currency)) e.push('currency');
    if (this.iE(this.currencySymbol)) e.push('currencySymbol');
    if (this.iE(this.priceStr)) e.push('priceStr');
    if (!(this.duration in ProjectPlanDurations)) e.push('duration');
    if (!this.platforms.length) e.push('platforms');
    this.platforms.forEach(p => {
      if (!(p in ProjectPlatforms)) e.push('platforms');
    });
    if (this.iE(this.title[defaultLanguage])) e.push('name');
    //
    return e;
  }
}
