export interface EmailDefaults {
  /**
   * The default email subject.
   */
  subject: string;
  /**
   * The default email content.
   */
  content: string;
  /**
   * Default addresses to who to send the email in TO.
   */
  to?: Array<string>;
  /**
   * Default addresses to who to send the email in CC.
   */
  cc?: Array<string>;
  /**
   * Default addresses to who to send the email in BCC.
   */
  bcc?: Array<string>;
}
