'use client';

import { useEffect, useState } from 'react';
import { useAuditorUser } from '../../AuditorUserContext';
import { ZohoIntegrationCard } from '../../../admin/components/ZohoIntegrationCard';

export default function ZohoIntegrationPage() {
  const user = useAuditorUser();
  const [query, setQuery] = useState<{ connected: boolean; error: string | null }>({ connected: false, error: null });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery({ connected: params.has('connected'), error: params.get('error') });
  }, []);
  const error = query.error;

  if (user.role !== 'ADMINISTRATOR') {
    return <main className="ops-main"><div className="notice notice-error">Administrator access is required.</div></main>;
  }

  return (
    <main className="ops-main">
      <div className="ops-intro"><div><h1>Zoho Mail integration</h1><p>Connect the Zoho organization used for employee mailbox provisioning.</p></div></div>
      {query.connected && <div className="notice notice-success">Zoho Mail connected successfully.</div>}
      {error && <div className="notice notice-error">{error === 'setup' ? 'Zoho connection setup is incomplete. Check the API environment settings.' : 'Zoho authorization could not be completed. Try connecting again.'}</div>}
      <ZohoIntegrationCard />
    </main>
  );
}
