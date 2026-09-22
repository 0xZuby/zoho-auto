import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { proposeAccountConfiguration } from '../src/config/rules.js';

describe('proposeAccountConfiguration', () => {
  test('maps a known department/team/position combination deterministically', () => {
    const proposal = proposeAccountConfiguration({
      department: 'Sales',
      team: 'Operations',
      jobPosition: 'Operator',
    });
    assert.equal(proposal.needsReview, false);
    assert.equal(proposal.role, 'Standard User');
    assert.deepEqual(proposal.groups, ['All Employees', 'Operations', 'Sales']);
  });

  test('is case-insensitive and trims whitespace', () => {
    const proposal = proposeAccountConfiguration({
      department: '  sales  ',
      team: 'OPERATIONS',
      jobPosition: 'operator',
    });
    assert.equal(proposal.role, 'Standard User');
    assert.deepEqual(proposal.groups, ['All Employees', 'Operations', 'Sales']);
  });

  test('produces the same output for the same input every time (deterministic)', () => {
    const input = { department: '3D', team: 'Modeler', jobPosition: 'Modeler Team Lead' };
    const first = proposeAccountConfiguration(input);
    const second = proposeAccountConfiguration(input);
    assert.deepEqual(first, second);
  });

  test('flags an unmapped department for review without granting privileged access', () => {
    const proposal = proposeAccountConfiguration({
      department: 'Some New Department',
      team: 'Operations',
      jobPosition: 'Operator',
    });
    assert.equal(proposal.needsReview, true);
    assert.ok(proposal.reasons.some((reason) => reason.includes('department')));
    // Even when flagged, the base "All Employees" group is still present but
    // no privileged group is invented from thin air.
    assert.deepEqual(proposal.groups, ['All Employees', 'Operations']);
  });

  test('flags an unmapped job position and falls back to a review-pending role rather than guessing', () => {
    const proposal = proposeAccountConfiguration({
      department: 'Sales',
      team: 'Operations',
      jobPosition: 'Chief Astronaut',
    });
    assert.equal(proposal.needsReview, true);
    assert.equal(proposal.role, 'Standard User (Pending Auditor Review)');
  });

  test('always includes the baseline "All Employees" group', () => {
    const proposal = proposeAccountConfiguration({ department: '', team: '', jobPosition: '' });
    assert.ok(proposal.groups.includes('All Employees'));
  });

  test('accepts the department spelling "Developement" (source form typo) via the Engineering mapping', () => {
    const proposal = proposeAccountConfiguration({ department: 'Developement', team: 'Web', jobPosition: 'Operator' });
    assert.equal(proposal.needsReview, false);
    assert.ok(proposal.groups.includes('Engineering'));
  });
});
