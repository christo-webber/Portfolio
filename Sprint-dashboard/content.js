
/*
 * ============================================================================
 *  content.js — ALL the words on the dashboard live in this file.
 * ============================================================================
 *
 *  How to edit:
 *    - Change only the text between the quotation marks.
 *    - Keep the quotation marks, and keep the semicolon at the end of each line.
 *    - If your text needs a double quotation mark ("), type it as \" instead.
 *    - Words in curly braces, like {target} or {percent}, are filled in
 *      automatically with live numbers. You can move them anywhere in the
 *      sentence or remove them, but don't rename them.
 *    - Save the file, then refresh the page in your browser to see the change.
 *
 *  This is a practice dashboard. Every number and ticket below is a placeholder.
 * ============================================================================
 */


/* ---------------------------------------------------------------------------
 *  Browser tab and brand
 * ------------------------------------------------------------------------ */

// The text shown on the browser tab.
var PAGE_TITLE = "Work Tracker — My tickets";

// The company name in the top bar and the footer.
var COMPANY_NAME = "Thomson Reuters";

// The small trademark symbol shown right after the company name.
var TRADEMARK_SYMBOL = "™";

// The product name shown next to the company name in the top bar.
var PRODUCT_NAME = "Work Tracker";


/* ---------------------------------------------------------------------------
 *  Top bar buttons
 *  These are icon-only buttons, so the words below aren't visible. Screen
 *  readers read them aloud, and they appear as a tooltip on hover.
 * ------------------------------------------------------------------------ */

// Screen reader name for the top bar as a whole.
var HEADER_LABEL = "Product";

// Screen reader name for the magnifying glass button.
var HEADER_SEARCH_LABEL = "Search";

// Screen reader name for the question mark button.
var HEADER_HELP_LABEL = "Help";

// Screen reader name for the bell button.
var HEADER_NOTIFICATIONS_LABEL = "Notifications";

// Screen reader name for the person button.
var HEADER_PROFILE_LABEL = "User profile";


/* ---------------------------------------------------------------------------
 *  Side navigation (left column)
 * ------------------------------------------------------------------------ */

// Screen reader name for the whole side navigation area.
var NAV_LABEL = "Main navigation";

// Screen reader name for the arrow button when the side navigation is open.
var NAV_COLLAPSE_LABEL = "Close side navigation";

// Screen reader name for the arrow button when the side navigation is closed.
var NAV_EXPAND_LABEL = "Open side navigation";

// First navigation link. This is the current page.
var NAV_MY_WORK = "My work";

// Second navigation link.
var NAV_BOARDS = "Boards";

// Third navigation link.
var NAV_SPRINTS = "Sprints";

// Fourth navigation link.
var NAV_REPORTS = "Reports";


/* ---------------------------------------------------------------------------
 *  Breadcrumb (the small "Home / My work" trail above the page title)
 * ------------------------------------------------------------------------ */

// Screen reader name for the breadcrumb trail.
var BREADCRUMB_LABEL = "Breadcrumb";

// The first link in the breadcrumb trail.
var BREADCRUMB_HOME = "Home";

// The last item in the breadcrumb trail, which is the current page.
var BREADCRUMB_CURRENT = "My work";


/* ---------------------------------------------------------------------------
 *  Page heading
 * ------------------------------------------------------------------------ */

// The small line of text above the main page title.
var SPRINT_EYEBROW = "Two-week cycle · Parallel to design sprint";

// The main page title.
var SPRINT_TITLE = "Sprint 15";

// The sentence below the page title. {target} becomes the target hours.
var SPRINT_INTRO = "Log hours against each work item for this sprint. Your running total is measured against a {target}-hour two-week target.";


/* ---------------------------------------------------------------------------
 *  "Sprint progress" card (the large card at the top)
 * ------------------------------------------------------------------------ */

// The title of the progress card.
var PROGRESS_CARD_TITLE = "Sprint progress";

// The text after the big hours number. {target} becomes the target hours.
var PROGRESS_TOTAL_SUFFIX = "/ {target} h";

// The line below the big number. {percent} becomes the percentage used.
var PROGRESS_CAPACITY_TEXT = "{percent}% of two-week capacity";

// The label above the progress bar.
var PROGRESS_BAR_LABEL = "Hours logged against two-week target";

// The small text at the right end of the progress bar. {percent} becomes the percentage used.
var PROGRESS_BAR_COMPLETE = "{percent}% complete";

// The small heading above the target hours box.
var TARGET_EYEBROW = "Sprint target";

// The label on the target hours box.
var TARGET_FIELD_LABEL = "Target hours";

// The small heading above the remaining hours number.
var REMAINING_EYEBROW = "Remaining";

// The remaining hours value. {hours} becomes the number of hours left.
var REMAINING_VALUE = "{hours} h";

// The button that clears logged hours and restores the default target.
var RESET_BUTTON = "Reset sprint";


/* ---------------------------------------------------------------------------
 *  Summary cards (the row of four small cards)
 * ------------------------------------------------------------------------ */

// Title of the first summary card.
var KPI_HOURS_TITLE = "Hours logged";

// Detail next to the hours logged number. {target} is the target, {estimate} is the total of all estimates.
var KPI_HOURS_DETAIL = "of {target} h · {estimate} h est.";

// Title of the second summary card.
var KPI_CAPACITY_TITLE = "Capacity used";

// Orange status chip, shown while capacity used is below 60%.
var STATUS_RAMPING_UP = "Ramping up";

// Green status chip, shown once capacity used reaches 60%.
var STATUS_ON_TRACK = "On track";

// Red status chip, shown when logged hours go past the target.
var STATUS_OVER_TARGET = "Over target";

// Title of the third summary card.
var KPI_REMAINING_TITLE = "Remaining";

// Detail next to the remaining hours number.
var KPI_REMAINING_DETAIL = "hours to target";

// Title of the fourth summary card.
var KPI_ACTIVE_TITLE = "Active tickets";

// Detail next to the active tickets number. {count} becomes the total number of tickets.
var KPI_ACTIVE_DETAIL = "{count} assigned total";


/* ---------------------------------------------------------------------------
 *  Ticket lists (the DIGITAL and DMK cards)
 * ------------------------------------------------------------------------ */

// The small line above each group's name. {logged} is how many tickets have hours, {total} is how many tickets are in the group.
var GROUP_PROGRESS = "{logged} of {total} logged";

// The label on each ticket's name box.
var TICKET_FIELD_LABEL = "Ticket";

// The label on each ticket's estimate box.
var ESTIMATE_FIELD_LABEL = "Estimate";

// The label on each ticket's logged hours box.
var LOGGED_FIELD_LABEL = "Logged";


/* ---------------------------------------------------------------------------
 *  Placeholder tickets
 *
 *  Each group becomes one card. You can edit:
 *    - name:  the card's heading (for example "DIGITAL")
 *    - title: the ticket name shown in the box
 *  The numbers are placeholder starting values:
 *    - estimate: estimated hours
 *    - hours:    hours already logged
 *    - active:   true if the ticket counts toward "Active tickets", otherwise false
 *  Leave each "id" number alone. The page uses it to remember your entries.
 * ------------------------------------------------------------------------ */

var TICKET_GROUPS = [
  {
    name: "DIGITAL",
    tickets: [
      { id: 4821, title: "Fix auth token refresh race condition", estimate: 8, hours: 6.5, active: true },
      { id: 4805, title: "Add pagination to matters list API", estimate: 12, hours: 8, active: true },
      { id: 4790, title: "Migrate document upload to Blob storage", estimate: 16, hours: 0, active: false },
      { id: 4777, title: "Timezone handling in audit log export", estimate: 5, hours: 4, active: false },
      { id: 4762, title: "Instrument dashboard load with tracing", estimate: 4, hours: 3.5, active: true },
      { id: 4751, title: "Reduce cold-start on search indexer", estimate: 6, hours: 0, active: false }
    ]
  },
  {
    name: "DMK",
    tickets: [
      { id: 4740, title: "Empty state for unassigned queue", estimate: 3, hours: 2, active: false },
      { id: 4725, title: "Rate-limit bulk export endpoint", estimate: 6, hours: 5, active: true },
      { id: 4712, title: "Refresh campaign analytics widgets", estimate: 7, hours: 3, active: true },
      { id: 4698, title: "Localize outreach email templates", estimate: 5, hours: 0, active: false }
    ]
  }
];


/* ---------------------------------------------------------------------------
 *  Footer
 * ------------------------------------------------------------------------ */

// Screen reader name for the group of footer links.
var FOOTER_LINKS_LABEL = "Footer links";

// First footer link.
var FOOTER_TERMS = "Terms";

// Second footer link.
var FOOTER_PRIVACY = "Privacy";

// Third footer link.
var FOOTER_ACCESSIBILITY = "Accessibility";

// The copyright line at the bottom. {year} becomes the current year.
var FOOTER_COPYRIGHT = "© {year} Thomson Reuters. Work Tracker";
