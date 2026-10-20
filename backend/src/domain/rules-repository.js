import { getDefaultProvisioningRules } from '../config/rules.js';
import { isAccountType } from './account-types.js';
import { unprocessable } from '../lib/http-error.js';

/**
 * Centrally managed provisioning rules repository (PRD Epic 2: "As an admin,
 * I can manage approved positions and their account-type mappings without
 * changing code" & "configure the company email domain rule").
 */
export function createRulesRepository(store, { corporateEmailDomain = 'insidemaps.com' } = {}) {
  const collection = store.collection('provisioning-rules');

  async function getRules() {
    const existing = await collection.findOne(() => true);
    if (existing) return existing;
    return getDefaultProvisioningRules(corporateEmailDomain);
  }

  async function updateRules({ actorId, domainRule, positionMappings }) {
    const current = await getRules();
    const errors = {};

    const nextDomainRule = domainRule
      ? {
          defaultDomain: String(domainRule.defaultDomain ?? current.domainRule.defaultDomain).trim(),
          operationsDomain: String(domainRule.operationsDomain ?? current.domainRule.operationsDomain).trim(),
          operationsTeams: Array.isArray(domainRule.operationsTeams)
            ? domainRule.operationsTeams.map((team) => String(team).trim()).filter(Boolean)
            : current.domainRule.operationsTeams,
        }
      : current.domainRule;

    if (!nextDomainRule.defaultDomain || !nextDomainRule.defaultDomain.includes('.')) {
      errors.defaultDomain = 'Enter a valid default email domain.';
    }
    if (!nextDomainRule.operationsDomain || !nextDomainRule.operationsDomain.includes('.')) {
      errors.operationsDomain = 'Enter a valid operations email domain.';
    }

    let nextPositionMappings = current.positionMappings;
    if (Array.isArray(positionMappings)) {
      const seenPositions = new Set();
      nextPositionMappings = positionMappings.map((item, idx) => {
        const position = String(item.position ?? '').trim();
        const accountType = String(item.accountType ?? '').trim();
        const role = String(item.role ?? '').trim() || 'Standard User';
        const insideMapsRoles = Array.isArray(item.insideMapsRoles)
          ? item.insideMapsRoles.map((r) => String(r).trim()).filter(Boolean)
          : [role];
        const active = item.active !== false;

        if (!position) {
          errors[`positionMappings.${idx}.position`] = 'Position name is required.';
        } else {
          const normalized = position.toLowerCase();
          if (seenPositions.has(normalized)) {
            errors[`positionMappings.${idx}.position`] = `Duplicate position mapping for "${position}".`;
          }
          seenPositions.add(normalized);
        }
        if (!isAccountType(accountType)) {
          errors[`positionMappings.${idx}.accountType`] = 'Select a valid account type (ZOHO or INSIDEMAPS).';
        }
        return { position, accountType, role, insideMapsRoles, active };
      });
    }

    if (Object.keys(errors).length > 0) {
      throw unprocessable('Please correct the provisioning rules.', errors);
    }

    const nowIso = new Date().toISOString();
    const nextDoc = {
      ...current,
      version: (current.version ?? 1) + 1,
      updatedAt: nowIso,
      updatedBy: actorId ?? null,
      domainRule: nextDomainRule,
      positionMappings: nextPositionMappings,
    };

    const existing = await collection.findOne(() => true);
    if (existing) {
      return collection.updateOne((entry) => entry.id === existing.id, () => ({ ...nextDoc, id: existing.id }));
    }
    return collection.insertOne(nextDoc);
  }

  return { getRules, updateRules };
}
