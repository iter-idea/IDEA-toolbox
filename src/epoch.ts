/**
 * It's a date in epoch format: number of ms since reference date `1970-01-01T00:00:00.000Z`.
 * The type is an alias to avoid further explanation for each variable.
 */
export type epochDate = number;
/**
 * It's a date time in epoch format: number of ms since reference date `1970-01-01T00:00:00.000Z`.
 * The type is an alias to avoid further explanation for each variable.
 */
export type epochDateTime = number;

/**
 * It's a date time stored as ISO string `YYYY-MM-DDTHH:mm:ss.sssZ`.
 * The timezone is always UTC, as denoted by the suffix `Z`.
 * The type is an alias to avoid further explanation for each variable.
 */
export type ISOString = string;
/*
 * It's a date time stored as ISO string: `YYYY-MM-DD`.
 * It doesn't say anything about the timezone.
 * The type is an alias to avoid further explanation for each variable.
 */
export type ISODateString = string;

/**
 * @deprecated use ISODateString instead.
 */
export type epochISODateString = string;
/**
 * @deprecated use ISOString instead.
 */
export type epochISOString = string;
