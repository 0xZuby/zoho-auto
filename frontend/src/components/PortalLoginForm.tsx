'use client';

import { useState, type FormEvent } from 'react';
import { login } from '@/lib/auth-api';
import { ApiError } from '@/lib/api-client';

interface PortalLoginFormProps {
  onSignedIn: () => void;
  portalName?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  panelEyebrow?: string;
  panelIntro?: string;
  submitLabel?: string;
  submittingLabel?: string;
}

export function PortalLoginForm({
  onSignedIn,
  portalName = 'Auditor portal',
  heroTitle = 'Review requests. Provision with confidence.',
  heroSubtitle = 'Turn HR-submitted requests into approved, traceable Zoho access.',
  panelEyebrow = 'Auditor portal',
  panelIntro = 'Use your InsideMaps auditor account to review HR requests.',
  submitLabel = 'Enter auditor desk',
  submittingLabel = 'Signing in…',
}: PortalLoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      onSignedIn();
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="center-page">
      <div className="login-shell">
        <section className="login-visual">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden>AZ</span>
            <span>
              <span className="brand-name">{portalName}</span>
              <span className="brand-subtitle">HR → Zoho access</span>
            </span>
          </div>
          <h1>{heroTitle}</h1>
          <p>{heroSubtitle}</p>
        </section>

        <form className="login-panel stack gap-16" onSubmit={handleSubmit}>
          <div className="stack gap-4">
            <span className="text-muted text-sm">{panelEyebrow}</span>
            <h2>Sign in</h2>
            <p className="text-muted text-sm">{panelIntro}</p>
          </div>

          <div className="login-rule" aria-hidden />

          <div className="field">
            <label className="field-label" htmlFor="portal-email">
              Work email
            </label>
            <input
              id="portal-email"
              className="input"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="portal-password">
              Password
            </label>
            <input
              id="portal-password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error && <div className="notice notice-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </form>
      </div>
    </main>
  );
}
