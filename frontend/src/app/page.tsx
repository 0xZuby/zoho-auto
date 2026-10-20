import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="portal-landing-page">
      <div className="portal-landing">
        <header className="portal-landing-header">
          <div className="brand-lockup">
            <span className="brand-mark" aria-hidden>AZ</span>
            <span>
              <span className="brand-name">Access operations</span>
              <span className="brand-subtitle">InsideMaps · HR to Zoho</span>
            </span>
          </div>
          <span className="portal-live-status"><span aria-hidden />Internal workflow</span>
        </header>

        <div className="portal-landing-grid">
          <section className="portal-landing-copy">
            <span className="eyebrow">""</span>
            <h1>Start the request. Keep the decision clear.</h1>
            <p>
              HR can submit the employee and placement details here. An auditor will review the request, confirm the Zoho setup, and run provisioning.
            </p>

            <div className="portal-landing-actions">
              <Link href="/request-form" className="btn btn-primary">
                Open HR request form
              </Link>
              <Link href="/auditor" className="btn btn-secondary">
                Go to Auditor portal
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
