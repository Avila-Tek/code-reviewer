import { generateText, type LanguageModelV1 } from 'ai';

async function generateAReview(prompt: string, model: LanguageModelV1) {
  const { text } = await generateText({
    model,
    system: `You are an expert code reviewer assisting software engineers in improving code quality. Your focus is to:
        1. Spot potential issues (e.g., bugs, inefficiencies, security vulnerabilities).
        2. Suggest improvements based on coding best practices.
        3. Ensure readability and maintainability of the code.
        4. Check for consistency with existing project standards and styles.
      Your feedback should be clear, concise, and actionable to help engineers merge pull requests faster.`,
    prompt,
  });
  return text;
}

type CodeReviewParams = {
  diff: string;
  model: LanguageModelV1;
};

export function generateGeneralCodeReview({ diff, model }: CodeReviewParams) {
  return generateAReview(
    `Analyze the following code changes in this pull request. Highlight potential issues, inconsistencies, or anti-patterns in coding style, structure, or logic. Provide suggestions for improvements.
  Here is the code diff: ${diff}`,
    model
  );
}

export function generatePerformanceCodeReview({
  diff,
  model,
}: CodeReviewParams) {
  return generateAReview(
    `Examine the code changes for performance or efficiency improvements. Are there any potential optimizations, memory concerns, or slow operations that could be optimized?
    Consider the following code diff: ${diff}`,
    model
  );
}

export function generateSecurityCodeReview({ diff, model }: CodeReviewParams) {
  return generateAReview(
    `Review the code changes for any security vulnerabilities or practices that might introduce risk. Highlight any potential security flaws related to data handling, user input, authentication, or API exposure. Consider the following code diff: ${diff}`,
    model
  );
}

export function generateMaintainabilityCodeReview({
  diff,
  model,
}: CodeReviewParams) {
  return generateAReview(
    `Assess the following code changes for readability and maintainability. How could the code be structured to be easier to understand and maintain over time? Are there opportunities to simplify or clarify? Consider the following code diff: ${diff}`,
    model
  );
}

export function generateWalkthrough({ diff, model }: CodeReviewParams) {
  return generateAReview(
    `Create a able that have been changed in this pull request. For each file, briefly explain what type of change was made (e.g., new functionality, refactoring, bug fix) and how it fits into the overall context of the PR. Consider the following code diff: ${diff}`,
    model
  );
}

export function generateIssueValidation({ diff, model }: CodeReviewParams) {
  return generateAReview(
    `Given the following code changes, is this pull request ready to merge? Summarize any critical issues that should be addressed before merging, and highlight any sections that may require further review. Consider the following code diff: ${diff}`,
    model
  );
}
