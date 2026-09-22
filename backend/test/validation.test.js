import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateOnboardingSubmission, hasErrors, resolveChoiceValue } from '../src/domain/validation.js';
import { OTHER_VALUE } from '../src/config/catalog.js';

function validSubmission(overrides = {}) {
  return {
    requesterEmail: 'requester@insidemaps.com',
    requestType: 'NEW_HIRE',
    nameAndSurname: 'Jane Doe',
    privateEmail: 'jane.doe@gmail.com',
    country: 'Ukraine',
    department: 'Sales',
    team: 'Operations',
    subTeam: 'Product',
    jobPosition: 'Operator',
    managerEmail: 'manager@insidemaps.com',
    ...overrides,
  };
}

describe('validateOnboardingSubmission', () => {
  test('accepts a fully valid submission with no GitHub fields for a non-dev department', () => {
    const errors = validateOnboardingSubmission(validSubmission());
    assert.deepEqual(errors, {});
  });

  test('flags every required field as missing on an empty submission', () => {
    const errors = validateOnboardingSubmission({});
    for (const field of ['requesterEmail', 'requestType', 'nameAndSurname', 'privateEmail', 'country', 'department', 'team', 'subTeam', 'jobPosition', 'managerEmail']) {
      assert.ok(errors[field], `expected an error for ${field}`);
    }
  });

  test('rejects malformed email addresses', () => {
    const errors = validateOnboardingSubmission(validSubmission({ privateEmail: 'not-an-email' }));
    assert.equal(errors.privateEmail, 'Enter a valid email address.');
  });

  test('rejects an unknown request type', () => {
    const errors = validateOnboardingSubmission(validSubmission({ requestType: 'SOMETHING_ELSE' }));
    assert.ok(errors.requestType);
  });

  test('requires the companion "Other" field when a choice is set to Other', () => {
    const errors = validateOnboardingSubmission(validSubmission({ department: OTHER_VALUE, departmentOther: '' }));
    assert.equal(errors.departmentOther, 'Enter a value for "Department — Other".');
  });

  test('accepts a valid companion "Other" field', () => {
    const errors = validateOnboardingSubmission(validSubmission({ department: OTHER_VALUE, departmentOther: 'Legal' }));
    assert.equal(errors.department, undefined);
    assert.equal(errors.departmentOther, undefined);
  });

  test('rejects a choice value that is neither a catalog option nor Other', () => {
    const errors = validateOnboardingSubmission(validSubmission({ team: 'Not A Real Team' }));
    assert.ok(errors.team);
  });

  test('requires GitHub profile and repositories when department is Development', () => {
    const errors = validateOnboardingSubmission(validSubmission({ department: 'Development' }));
    assert.ok(errors.githubProfile);
    assert.ok(errors.githubRepositories);
  });

  test('does not require GitHub fields for a non-development department', () => {
    const errors = validateOnboardingSubmission(validSubmission({ department: 'Sales' }));
    assert.equal(errors.githubProfile, undefined);
    assert.equal(errors.githubRepositories, undefined);
  });

  test('accepts a submission with GitHub fields filled in for Development', () => {
    const errors = validateOnboardingSubmission(
      validSubmission({ department: 'Development', githubProfile: 'https://github.com/janedoe', githubRepositories: 'org/repo' }),
    );
    assert.deepEqual(errors, {});
  });
});

describe('hasErrors', () => {
  test('is false for an empty errors object', () => {
    assert.equal(hasErrors({}), false);
  });

  test('is true when at least one error is present', () => {
    assert.equal(hasErrors({ foo: 'bar' }), true);
  });
});

describe('resolveChoiceValue', () => {
  test('returns the choice value when it is not the Other sentinel', () => {
    assert.equal(resolveChoiceValue('Sales', ''), 'Sales');
  });

  test('returns the trimmed other value when the choice is the Other sentinel', () => {
    assert.equal(resolveChoiceValue(OTHER_VALUE, '  Legal  '), 'Legal');
  });
});
