/**
 * Confirms a proposed corporate email is not already committed to a
 * different request (PRD provisioning-sequence step "Email availability
 * checked"). Comparison excludes the request being provisioned itself so a
 * retry of the same request doesn't fail against its own reserved address.
 */
export function createEmailAvailabilityChecker(requestRepository) {
  return async function checkEmailAvailability(corporateEmail, currentRequestId) {
    const summaries = await requestRepository.listSummaries();
    for (const summary of summaries) {
      if (summary.id === currentRequestId) continue;
      const full = await requestRepository.getById(summary.id);
      const claimedEmail = full.resolvedAccount?.corporateEmail;
      if (claimedEmail && claimedEmail.toLowerCase() === String(corporateEmail).toLowerCase()) {
        const hasSucceededCreate = full.provisioning.steps.some((step) => step.name === 'create_user' && step.outcome === 'SUCCESS');
        if (hasSucceededCreate) return false;
      }
    }
    return true;
  };
}
