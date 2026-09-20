'use client';

import { FormEvent, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import { Mascot } from '../../components/Mascot';

type Values = Record<string, string>;
type Field = readonly [string, string, 'text' | 'email' | 'select' | 'textarea'];
type Step = { title: string; shortTitle: string; copy: string; fields: readonly Field[] };

const personal: Step = { title: 'Tell us about you', shortTitle: 'About you', copy: 'We use these details to contact you about your new account.', fields: [['nameAndSurname', 'Full name', 'text'], ['privateEmail', 'Personal email', 'email'], ['country', 'Country', 'select']] };
const work: Step = { title: 'Add your work details', shortTitle: 'Work details', copy: 'This helps the onboarding team prepare your request for review.', fields: [['department', 'Department', 'select'], ['emailAddress', 'Requested work email', 'email'], ['jobPosition', 'Job position', 'text']] };
const developer: Step = { title: 'Request developer access', shortTitle: 'Developer access', copy: 'Only complete this step if you need access to development tools or repositories.', fields: [['githubProfile', 'GitHub profile', 'text'], ['githubRepos', 'Repositories to add', 'textarea']] };
const initial: Values = Object.fromEntries([...personal.fields, ...work.fields, ...developer.fields].map(([key]) => [key, '']));
const countries = ['Bangladesh', 'India', 'United Kingdom', 'United States', 'Other'];
const departments = ['Development', 'Operations', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Other'];
const emailPattern = /^\S+@\S+\.\S+$/;

function isDev(values: Values) { return values.department.toLowerCase().trim() === 'development'; }
function validate(values: Values, fields: readonly Field[]) {
  const errors: Values = {};
  for (const [name] of fields) {
    if (!values[name]?.trim()) errors[name] = 'This field is required.';
    else if (name.toLowerCase().includes('email') && !emailPattern.test(values[name])) errors[name] = 'Enter a valid email address.';
  }
  return errors;
}

export default function OnboardingPage() {
  const [values, setValues] = useState<Values>(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Values>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const steps = useMemo(() => isDev(values) ? [personal, work, developer] : [personal, work], [values]);
  const reviewing = step === steps.length;
  const current = steps[step];
  const total = steps.length + 1;
  const progress = Math.round(((step + 1) / total) * 100);

  function update(name: string, value: string) {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name] && current) setErrors(validate(next, current.fields));
  }
  function blur(name: string) {
    setTouched((currentTouched) => ({ ...currentTouched, [name]: true }));
    if (current) setErrors(validate(values, current.fields));
  }
  function next() {
    if (!current) return;
    const found = validate(values, current.fields);
    setErrors(found);
    setTouched((currentTouched) => ({ ...currentTouched, ...Object.fromEntries(current.fields.map(([name]) => [name, true])) }));
    if (!Object.keys(found).length) setStep((value) => value + 1);
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    const allFields = steps.flatMap((item) => item.fields);
    const found = validate(values, allFields);
    setErrors(found);
    if (Object.keys(found).length) {
      const index = steps.findIndex((item) => item.fields.some(([name]) => found[name]));
      setStep(index < 0 ? 0 : index);
      return;
    }
    setBusy(true);
    try {
      const result = await api.submit(values);
      setSubmitted(result.requestCode);
    } catch (error: unknown) {
      const body = error as { errors?: Values; error?: string };
      setErrors(body.errors || { form: body.error || 'We could not submit your request. Please try again.' });
    } finally {
      setBusy(false);
    }
  }
  function reset() { setValues(initial); setErrors({}); setTouched({}); setSubmitted(null); setStep(0); }
  const feedback = (name: string) => errors[name] && (touched[name] || reviewing) ? <small id={`${name}-error`} className="field-error">{errors[name]}</small> : null;

  if (submitted) return <main className="onboarding-page"><section className="success-panel" aria-labelledby="success-title"><div className="success-mark" aria-hidden="true">✓</div><span className="eyebrow">ONBOARDLY · EMPLOYEE ONBOARDING</span><h1 id="success-title">Information submitted</h1><p>Your request is with the onboarding team. We’ll email your account information after it has been reviewed and processed.</p><div className="request-code"><span>Request reference</span><strong>{submitted}</strong></div><button onClick={reset}>Submit another request</button></section></main>;

  return <main className="onboarding-page"><section className="onboarding-layout">
    <div className="onboarding-main">
      <header className="onboarding-header"><a className="wordmark" href="/onboarding"><span>o</span><strong>onboardly</strong></a><span className="secure-note">Secure onboarding form</span></header>
      <div className="onboarding-progress" aria-label={`Step ${step + 1} of ${total}`}><div className="progress-top"><span>Onboarding progress</span><strong>Step {step + 1} of {total}</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><ol>{[...steps, { title: 'Review', shortTitle: 'Review' }].map((item, index) => <li key={item.shortTitle} className={index === step ? 'current' : index < step ? 'complete' : ''} aria-current={index === step ? 'step' : undefined}><b>{index < step ? '✓' : index + 1}</b><span>{item.shortTitle}</span></li>)}</ol></div>
      <header className="step-header"><span className="eyebrow">{reviewing ? 'FINAL CHECK' : `STEP ${step + 1}`}</span><h1>{reviewing ? 'Review your information' : current.title}</h1><p>{reviewing ? 'Check the details below before sending your request to the onboarding team.' : current.copy}</p></header>
      <form onSubmit={reviewing ? submit : (event) => { event.preventDefault(); next(); }}>
        {!reviewing ? <fieldset className="field-grid"><legend className="sr-only">{current.title}</legend>{current.fields.map(([name, label, type]) => <label className="field" key={name}>{label}{type === 'select' ? <select value={values[name]} onChange={(event) => update(name, event.target.value)} onBlur={() => blur(name)} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined}><option value="">Choose {label.toLowerCase()}</option>{(name === 'country' ? countries : departments).map((option) => <option key={option}>{option}</option>)}</select> : type === 'textarea' ? <textarea value={values[name]} onChange={(event) => update(name, event.target.value)} onBlur={() => blur(name)} placeholder="One per line or comma-separated" aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} /> : <input type={type} value={values[name]} onChange={(event) => update(name, event.target.value)} onBlur={() => blur(name)} autoComplete={name === 'privateEmail' ? 'email' : name === 'nameAndSurname' ? 'name' : 'off'} aria-invalid={Boolean(errors[name])} aria-describedby={errors[name] ? `${name}-error` : undefined} />}{feedback(name)}</label>)}</fieldset> : <div className="review-groups">{steps.map((item) => <section className="review-group" key={item.shortTitle}><div className="review-group-heading"><div><span className="eyebrow">{item.shortTitle}</span><h2>{item.title}</h2></div><button type="button" className="text-button" onClick={() => setStep(steps.indexOf(item))}>Edit</button></div><dl>{item.fields.map(([name, label]) => <div key={name}><dt>{label}</dt><dd>{values[name] || '—'}</dd></div>)}</dl></section>)}</div>}
        {errors.form && <p className="form-error" role="alert">{errors.form}</p>}
        <div className="form-actions">{step > 0 && <button type="button" className="button-secondary" onClick={() => setStep((value) => value - 1)}>Back</button>}<span />{reviewing ? <button disabled={busy}>{busy ? 'Submitting request…' : 'Submit onboarding request'} <span aria-hidden="true">→</span></button> : <button type="submit">Continue <span aria-hidden="true">→</span></button>}</div>
      </form>
    </div>
    <aside className="onboarding-aside"><div><span className="eyebrow">A CLEAR START</span><h2>Your details help the team prepare your access.</h2><p>This form takes a few minutes. Your personal information is only shared with the onboarding team for account setup.</p></div><div className="aside-visual"><Mascot mood={reviewing ? 'celebrate' : step > 0 ? 'progress' : 'idle'} /><span className="visual-caption">Your onboarding guide</span></div><div className="aside-callout"><span aria-hidden="true">✓</span><div><strong>What happens next?</strong><p>We review your request, configure your Zoho account, and send instructions to your personal email.</p></div></div><small>Need help? Contact your onboarding team.</small></aside>
  </section></main>;
}
