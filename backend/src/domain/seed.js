import { ROLE } from './users.js';

/**
 * Seeds the local Administrator and Auditor accounts so the portal is
 * reachable without a manual database insert. Each account is checked
 * independently, which also adds the Auditor account to existing local data
 * that was created before the dedicated test credentials existed.
 */
export async function seedDefaultAdministrator(userRepository, logger = console) {
  const accounts = [
    {
      name: 'Default Administrator',
      email: process.env.SEED_ADMIN_EMAIL ?? 'admin@insidemaps.com',
      password: process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!',
      role: ROLE.ADMINISTRATOR,
      label: 'administrator',
      envHint: 'SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD',
    },
    {
      name: 'Default Auditor',
      email: process.env.SEED_AUDITOR_EMAIL ?? 'auditor@insidemaps.com',
      password: process.env.SEED_AUDITOR_PASSWORD ?? 'Auditor123!',
      role: ROLE.AUDITOR,
      label: 'auditor',
      envHint: 'SEED_AUDITOR_EMAIL / SEED_AUDITOR_PASSWORD',
    },
    {
      name: 'Default HR',
      email: process.env.SEED_HR_EMAIL ?? 'hr@insidemaps.com',
      password: process.env.SEED_HR_PASSWORD ?? 'HrPortal123!',
      role: ROLE.HR,
      label: 'HR',
      envHint: 'SEED_HR_EMAIL / SEED_HR_PASSWORD',
    },
  ];

  for (const account of accounts) {
    if (await userRepository.findByEmail(account.email)) continue;

    await userRepository.create(account);
    logger.info(
      `[seed] Created default ${account.label} account: ${account.email} / ${account.password}\n` +
        `[seed] Change this password immediately or set ${account.envHint} before first boot.`,
    );
  }
}
