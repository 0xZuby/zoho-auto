import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAuditorConfiguration, validateAuditorConfigurationPatch, validateSubmission, validateSubmissionPatch } from '../src/validation.js';

const valid = { nameAndSurname: 'Ava Shah', privateEmail: 'ava@personal.test', country: 'Bangladesh', department: 'Operations', jobPosition: 'Analyst' };
const configuration = { team: 'Support', managerEmail: 'lead@company.test', requestType: 'New hire', emailAddress: 'ava@company.test', subTeam: 'Tier 1' };

test('accepts a complete non-development submission', () => assert.deepEqual(validateSubmission(valid), {}));
test('requires GitHub values for Development', () => {
  const errors = validateSubmission({ ...valid, department: 'Development' });
  assert.equal(errors.githubProfile, 'GitHub profile is required for Development.');
  assert.equal(errors.githubRepos, 'At least one GitHub repository is required for Development.');
});
test('validates addresses', () => assert.equal(validateSubmission({ ...valid, privateEmail: 'invalid' }).privateEmail, 'Enter a valid email address.'));
test('requires complete auditor configuration', () => assert.equal(validateAuditorConfiguration({ ...configuration, team: '' }).team, 'This field is required.'));
test('validates auditor-controlled email addresses', () => assert.equal(validateAuditorConfiguration({ ...configuration, managerEmail: 'invalid' }).managerEmail, 'Enter a valid email address.'));
test('allows incremental record edits while preserving email validation', () => {
  assert.deepEqual(validateSubmissionPatch({}), {});
  assert.deepEqual(validateAuditorConfigurationPatch({ team: '' }), {});
  assert.equal(validateAuditorConfigurationPatch({ emailAddress: 'invalid' }).emailAddress, 'Enter a valid email address.');
});
