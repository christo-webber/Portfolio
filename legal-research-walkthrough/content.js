// -----------------------------------------------------------------------------
// How to edit this file
// -----------------------------------------------------------------------------
// This file holds every word a learner sees in the tutorial.
//
// Safe to change: the wording inside quotes ("like this") or backticks (`like this`).
// Leave as-is: the names on the left of each equals sign, the quotes or backticks
// around the wording, and the semicolon at the end of each line.
//
// Longer instructions use backticks so you can press Enter and write in paragraphs.
// A completely blank line starts a new paragraph. You can wrap a paragraph onto
// more than one line. Do not delete the backtick at the start or the end, and
// do not type a backtick inside the wording.
//
// Some short lines contain markers like {current} or {year}. Those get filled in
// automatically. Leave the markers, including the curly braces, as they are.
//
// You do not need to edit index.html, styles.css, or app.js to change wording.
// -----------------------------------------------------------------------------
// Page chrome — title, progress, and buttons
// -----------------------------------------------------------------------------
// Text in the browser tab.
var tutorialDocumentTitle = "How to run an effective search";
// Small label above the title on every step.
var tutorialEyebrow = "Research practice";
// Main title on every step.
var tutorialTitle = "How to run an effective search";
// Line under the title. Says who this walkthrough is for.
var tutorialSubtitle = "A guided practice for new and occasional legal researchers.";
// Keyboard skip link. Hidden until a keyboard user focuses it.
var skipLinkLabel = "Skip to this step";
// Progress line at the top. {current} is the step number. {total} is how many steps there are.
var stepCounterTemplate = "Step {current} of {total}";
// Name of the progress bar, read by screen readers. Not shown on screen.
var progressAriaLabel = "Walkthrough progress";
// Heading of the tinted box at the bottom of every step.
var whyThisMattersHeading = "Why this matters";
// Back button.
var backButtonLabel = "Back";
// Next button, on every step except the last.
var nextButtonLabel = "Next";
// Button on the last step, before the learner finishes.
var finishButtonLabel = "Finish";
// Button on the last step after the learner finishes. It is no longer clickable.
var finishedButtonLabel = "Done";
// Confirmation shown after Finish is clicked.
var finishedMessage = "That's the end of the walkthrough. Use Back to revisit any step.";
// Small print in the footer on every step.
var tutorialFooterNote = "A practice walkthrough. Not a live research service, and not a statement of the law.";
// -----------------------------------------------------------------------------
// Step 1 — Frame the question
// -----------------------------------------------------------------------------
// Step name in the header.
var step1Title = "Frame the question";
// Teaching text above the practice box. A blank line starts a new paragraph.
var step1Instruction = `
Before you search, decide what you are actually asking.
A client rarely arrives with a legal issue. They arrive with a situation: "Can I be fired for refusing unsafe work?" Those words do not say which workplace law applies, which province or court you care about, or whether you are asking about the right to refuse, the dismissal, or the remedy.
Turn the situation into an issue statement. In a sentence or two, name the legal question and the place whose law you need. You are not predicting the answer. You are choosing what the search is for.
Notice the words, too. A client says "fired." The decisions are more likely to say "dismissed" or "terminated." Your issue statement can use the legal word. You will need it when you search.
`;
// Heading inside the practice box.
var step1PracticeTitle = "Rewrite the question you were given";
// Label above the client's wording.
var step1PromptLabel = "The question you were given";
// The vague research prompt, shown as a quote.
var step1PromptText = "Client asks: can I be fired for refusing unsafe work?";
// Label for the text box.
var step1IssueLabel = "Your issue statement";
// Faded hint inside the text box, before the learner types.
var step1IssuePlaceholder = "Write the issue in one or two sentences.";
// Help text under the text box.
var step1IssueHelp = "This box is only for practice. Nothing you type is checked or saved. One way to shape the question: whether an employee in Ontario may be dismissed for refusing work they reasonably believe is unsafe, and what follows if that dismissal was a reprisal.";
// Text in the "Why this matters" box.
var step1Why = `
The first search is only as precise as the issue you named. The client's wording, typed in as-is, pulls in news, commentary, and cases about other statutes and other places. A specific issue tells you which of those you meant to find.
`;
// -----------------------------------------------------------------------------
// Step 2 — Run the first search
// -----------------------------------------------------------------------------
// Step name in the header.
var step2Title = "Run the first search";
// Teaching text above the practice box.
var step2Instruction = `
With the issue in mind, you still choose how to ask the platform.
A natural-language search takes a sentence written the way a person would ask it. The platform decides which words matter and how to rank what it finds. It is a useful first pass when you are still learning the vocabulary of the area.
A terms-and-connectors search takes instructions. You choose the words, the alternatives, and how close those words must be to each other. It takes longer to write, and it is easier to keep the results on the issue you framed.
The natural-language example stays close to the client's words. The terms-and-connectors example uses words a decision is more likely to contain. Select either type. Both examples stay on screen so you can compare them.
`;
// Heading inside the practice box.
var step2PracticeTitle = "Compare two ways to search";
// Accessible name for the pair of choices. Read by screen readers.
var step2SearchTypeLabel = "Search type";
// Label on the first choice.
var step2NaturalTabLabel = "Natural language";
// The natural-language example query.
var step2NaturalQuery = "Can an employee be fired for refusing unsafe work in Ontario?";
// One-line explanation under the natural-language example.
var step2NaturalCaption = "A full question, in ordinary words. The platform decides which words matter.";
// Label on the second choice.
var step2ConnectorsTabLabel = "Terms and connectors";
// The terms-and-connectors example query.
var step2ConnectorsQuery = "fired OR dismiss! OR terminat! /s refus! /s unsafe AND Ontario";
