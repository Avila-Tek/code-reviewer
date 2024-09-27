import * as core from '@actions/core';
import * as github from '@actions/github';
import { createOpenAI } from '@ai-sdk/openai';
import {
  generateGeneralCodeReview,
  generatePerformanceCodeReview,
  generateSecurityCodeReview,
  generateMaintainabilityCodeReview,
  generateWalkthrough,
  generateIssueValidation,
} from './ai';

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const OPEN_AI_KEY = core.getInput('OPEN_AI_KEY', {
      required: true,
    });
    const token = core.getInput('GITHUB_TOKEN');
    const octokit = github.getOctokit(token);
    const model = createOpenAI({
      apiKey: OPEN_AI_KEY,
    }).languageModel('gpt-4o');

    const { owner, repo } = github.context.repo;
    const pull_number = github.context.payload.pull_request?.number;

    if (typeof pull_number === 'undefined') {
      core.error('TypeError pull_number var is undefined');
      return;
    }

    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: 'diff',
      },
    });
    const diff = pullRequest.body;

    if (typeof diff === 'undefined' || diff === null) {
      core.error('TypeError diff var is undefined');
      return;
    }
    const [
      generalCodeReview,
      performanceCodeReview,
      securityCodeReview,
      maintainabilityCodeReview,
      walkthrough,
      issueValidation,
    ] = await Promise.allSettled([
      generateGeneralCodeReview({ diff, model }),
      generatePerformanceCodeReview({ diff, model }),
      generateSecurityCodeReview({ diff, model }),
      generateMaintainabilityCodeReview({ diff, model }),
      generateWalkthrough({ diff, model }),
      generateIssueValidation({ diff, model }),
    ]);
    core.debug(new Date().toTimeString());

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: `# Automatic code review for #${pull_number}

      ## Description
      ${generalCodeReview}

      ## Walkthrough
      ${walkthrough}

      ## Perfomance
      ${performanceCodeReview}

      ## Security
      ${securityCodeReview}

      ## Maintainability
      ${maintainabilityCodeReview}

      ## Is mergeable?
      ${issueValidation}
      `,
    });
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}
