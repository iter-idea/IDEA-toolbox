import { Resource } from './resource.model';
import { Label } from './label.model';
import { Languages } from './languages.model';

/**
 * Expressed in months (WEEK is an exception, with value 0).
 */
export enum ProjectPlanDurations {
  WEEK = 0,
  MONTH_1 = 1,
  MONTH_2 = 2,
  MONTH_3 = 3,
  MONTH_6 = 6,
  YEAR_1 = 12,
  LIFETIME = 9999
}

export enum ProjectPlatforms {
  WEB = 'web',
  IOS = 'ios',
  ANDROID = 'android',
  MACOS = 'macos',
  WINDOWS = 'windows'
}

export enum ProjectPlanTargets {
  USERS = 'users',
  TEAMS = 'teams'
}

/**
 * Table: `idea_projects_plans`.
 *
 * Indexes:
 *   - `project-order-index` (LSI, all).
 */
export class ProjectPlan extends Resource {
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
  /**
   * If true, the plan is set as Gold plan and this will be threaded in different ways according to the project.
   */
  public gold: boolean;
  /**
   * The plan targets: USERS, TEAMS.
   */
  public target: ProjectPlanTargets;

  public load(x: any, languages?: Languages) {
    super.load(x);
    this.project = this.clean(x.project, String);
    this.planId = this.clean(x.planId, String);
    this.storePlanId = this.clean(x.storePlanId, String);
    this.price = this.clean(x.price, Number);
    this.currency = this.clean(x.currency, String, 'EUR');
    this.currencySymbol = this.clean(x.currencySymbol, String, '€');
    this.priceStr = this.clean(x.priceStr, String);
    this.duration = this.clean(x.duration, Number, ProjectPlanDurations.MONTH_1);
    this.platforms = x.platforms ? this.clean(x.platforms, String) : [ProjectPlatforms.WEB];
    this.title = new Label(x.title, languages);
    this.description = new Label(x.description, languages);
    this.order = this.clean(x.order, Number, 0);
    this.special = this.clean(x.special, Boolean);
    this.gold = this.clean(x.gold, Boolean);
    this.target = this.clean(x.target, String, ProjectPlanTargets.USERS);
  }

  public safeLoad(newData: any, safeData: any, languages?: Languages) {
    this.safeLoad(newData, safeData, languages);
    this.project = safeData.project;
    this.planId = safeData.planId;
    this.special = safeData.special;
    this.gold = safeData.gold;
  }

  public validate(languages?: Languages): Array<string> {
    let e = super.validate();
    if (this.iE(this.storePlanId)) e.push('storePlanId');
    if (this.iE(this.price)) e.push('price');
    if (this.iE(this.currency)) e.push('currency');
    if (this.iE(this.currencySymbol)) e.push('currencySymbol');
    if (this.iE(this.priceStr)) e.push('priceStr');
    if (!(this.duration in ProjectPlanDurations)) e.push('duration');
    if (!this.platforms.length || this.platforms.some(p => !(p in ProjectPlatforms))) e.push('platforms');
    if (!(this.target in ProjectPlanTargets)) e.push('target');
    e = e.concat(this.title.validate(languages));
    return e;
  }
}
