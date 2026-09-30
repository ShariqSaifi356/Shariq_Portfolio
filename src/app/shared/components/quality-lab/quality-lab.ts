import { Component, computed, signal } from '@angular/core';
import { MotionChange } from '../../directives/motion-change';

type Layer = 'design' | 'automate' | 'investigate';
interface TestLens {
  title: string;
  checks: string[];
  edge: string;
  sample: string;
}
interface Scenario {
  name: string;
  context: string;
  flow: string[];
  lenses: Record<Layer, TestLens>;
}

@Component({
  selector: 'app-quality-lab',
  imports: [MotionChange],
  templateUrl: './quality-lab.html',
  styleUrl: './quality-lab.css',
})
export class QualityLab {
  readonly scenarios: Scenario[] = [
    {
      name: 'UI automation',
      context:
        'Maintainable regression coverage with Selenium, Playwright, Pytest, and Page Object Model.',
      flow: [
        'Requirements & regression scope',
        'Page objects & test data',
        'Failure evidence & root cause',
      ],
      lenses: {
        design: {
          title: 'Turn business rules into regression coverage.',
          checks: [
            'Break a workflow into preconditions, actions, and observable outcomes; trace each check to a requirement.',
            'Separate smoke coverage from broader regression, and include invalid inputs and boundary conditions.',
            'Use data-driven cases for variations in business rules instead of duplicating the same test.',
          ],
          edge: 'A test completes every click but never verifies the business outcome. Add an assertion that proves the expected state changed; successful navigation alone is not enough.',
          sample:
            'Requirement → scenario → test data\nSmoke: critical workflow\nRegression: valid, invalid, boundary cases',
        },
        automate: {
          title: 'Keep test intent separate from UI mechanics.',
          checks: [
            'Put locators and reusable interactions in page objects; keep the business scenario readable in the test.',
            'Use Pytest fixtures for setup and cleanup, and parameterize cases that share the same workflow.',
            'Wait for meaningful UI states before interacting, then assert the result rather than adding fixed delays.',
          ],
          edge: 'A locator changes in a shared screen. Update the page object and rerun the affected scenarios; avoid copying the same locator fix across individual tests.',
          sample:
            'test → page object → application\nfixture: setup / cleanup\nassertion: expected business outcome',
        },
        investigate: {
          title: 'Find the cause before changing the test.',
          checks: [
            'Inspect the failed step, screenshot, and test data to identify what differed from the expected result.',
            'Distinguish an application defect from a locator, synchronization, data, or environment issue.',
            'Reproduce with the same inputs and record clear evidence before fixing the script or raising a defect.',
          ],
          edge: 'A test passes on rerun. Check timing, shared data, and environment dependencies before treating it as resolved; a retry is evidence to investigate, not a fix.',
          sample:
            'Failure → reproduce → classify\nProduct issue: defect with evidence\nTest issue: fix and verify stability',
        },
      },
    },
    {
      name: 'API & messages',
      context:
        'REST API, JSON/XML, and backend validation using Postman, Requests, Newman, and SQL.',
      flow: [
        'API contracts & business rules',
        'Payload, schema & response checks',
        'Message-to-database validation',
      ],
      lenses: {
        design: {
          title: 'Cover the contract and the business rule.',
          checks: [
            'Read the API specification to identify required fields, supported values, and expected responses.',
            'Design positive and negative cases for missing fields, invalid formats, and business-rule violations.',
            'For SWIFT and ISO15022/ISO20022 work, map the applicable message requirements to explicit validation checks.',
          ],
          edge: 'A payload has the correct structure but an invalid business value. Schema checks and business-rule checks need separate assertions so this defect is not missed.',
          sample:
            'Coverage: contract + business rules\nInputs: valid / missing / invalid\nExpected: documented response and state',
        },
        automate: {
          title: 'Validate more than the status code.',
          checks: [
            'Use Postman or Python Requests to check response fields, types, values, and error details.',
            'Validate JSON/XML payloads against the applicable schema and check the returned business outcome.',
            'Run collection checks with Newman; use WireMock for controlled dependency responses and Pact for contract checks where applicable.',
          ],
          edge: 'An API returns HTTP 200 with an incorrect status or value in the body. Assert the response content as well as the HTTP code to catch the mismatch.',
          sample:
            'HTTP response → schema → field checks\nBusiness outcome → expected value\nDependency behavior → controlled response',
        },
        investigate: {
          title: 'Trace a mismatch across the integration.',
          checks: [
            'Compare the submitted payload with the response and relevant message fields to locate the first mismatch.',
            'Use SQL and Oracle SQL Developer to verify stored values, transaction state, and data integrity.',
            'Capture the request, response, and database evidence so the defect can be reproduced and assigned to the right layer.',
          ],
          edge: 'The response indicates success but the stored record does not match the expected state. Check the documented processing behavior before classifying a delay or a data defect.',
          sample:
            'Input payload → service response\nBusiness reference → database record\nExpected state ↔ stored state',
        },
      },
    },
    {
      name: 'CI & release checks',
      context:
        'Repeatable suite execution and useful release feedback with Jenkins, GitHub Actions, and defect triage.',
      flow: [
        'Suite scope & prerequisites',
        'Pipeline execution & reports',
        'Defect triage & release validation',
      ],
      lenses: {
        design: {
          title: 'Choose coverage that answers a release question.',
          checks: [
            'Identify smoke checks for core functionality and regression checks for changed or dependent areas.',
            'Confirm environment access, test data, and service prerequisites before scheduling a suite.',
            'Define the expected outcomes and evidence needed for review, including API and database checks where relevant.',
          ],
          edge: 'A green pipeline covers only a small subset of the release. Review the executed scope and known gaps before using that result to support a release decision.',
          sample:
            'Change scope → affected scenarios\nPrerequisites → environment + data\nReview scope → smoke + regression',
        },
        automate: {
          title: 'Make execution repeatable and results visible.',
          checks: [
            'Integrate automated suites with Jenkins or GitHub Actions using consistent environment and test configuration.',
            'Publish test results with enough context to identify the failing scenario, assertion, and inputs.',
            'Keep failed checks visible in the execution result, and distinguish skipped tests from executed coverage.',
          ],
          edge: 'The pipeline completes but no tests execute. Check the selected suite and reported test counts; successful job execution is not the same as successful test coverage.',
          sample:
            'Prepare → execute → publish results\nReview: passed / failed / skipped\nRetain: reports and failure evidence',
        },
        investigate: {
          title: 'Turn failures into actionable release feedback.',
          checks: [
            'Triage failures with the team, separating product defects from automation and environment problems.',
            'Document reproducible steps, expected versus actual behavior, and supporting evidence in the defect report.',
            'Retest fixes, run the affected regression scope, and communicate remaining issues during UAT and release validation.',
          ],
          edge: 'A fix resolves the reported case but changes a shared workflow. Recheck related scenarios and data outcomes before closing the issue.',
          sample:
            'Failed check → defect triage\nFix → retest → affected regression\nRelease feedback: evidence + open risks',
        },
      },
    },
  ];
  readonly layers: { id: Layer; number: string; name: string }[] = [
    { id: 'design', number: '01', name: 'Design coverage' },
    { id: 'automate', number: '02', name: 'Build checks' },
    { id: 'investigate', number: '03', name: 'Investigate & verify' },
  ];
  readonly selectedScenario = signal(0);
  readonly selectedLayer = signal<Layer>('design');
  readonly showEdge = signal(false);
  readonly scenario = computed(() => this.scenarios[this.selectedScenario()]);
  readonly lens = computed(() => this.scenario().lenses[this.selectedLayer()]);
}
