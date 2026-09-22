'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api-client';
import {
  getEmployeeSubmission,
  getFormCatalog,
  offboardEmployee,
  submitOnboardingForm,
  updateEmployeeInfo,
} from '@/lib/form-api';
import type { EmployeeDirectoryEntry, FormCatalog } from '@/lib/types';
import { validateStageOne, validateStageThree, validateStageTwo } from '@/lib/validate-onboarding-form';
import { useOnboardingForm } from './useOnboardingForm';
import { StageIndicator } from './components/StageIndicator';
import { StageOneRequest } from './components/StageOneRequest';
import { StageTwoPlacement } from './components/StageTwoPlacement';
import { StageThreeReview } from './components/StageThreeReview';
import { SubmissionConfirmation } from './components/SubmissionConfirmation';
import { EmployeeSearchStage } from './components/EmployeeSearchStage';
import { OffboardingReviewStage } from './components/OffboardingReviewStage';
import { UpdateEmployeeStage } from './components/UpdateEmployeeStage';

type WizardStage = 1 | 2 | 3;

const STAGE_TITLES: { step: number; title: string }[] = [
  { step: 1, title: 'Request' },
  { step: 2, title: 'Details' },
  { step: 3, title: 'Review & submit' },
];

interface Confirmation {
  requestCode?: string;
  title: string;
  message: string;
}

export default function RequestFormPage() {
  const [catalog, setCatalog] = useState<FormCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [stage, setStage] = useState<WizardStage>(1);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  // Shared across LEAVING_COMPANY / UPDATE_EMPLOYEE_INFO: the employee HR
  // found and selected in stage 2.
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDirectoryEntry | null>(null);
  const [isLoadingEmployee, setIsLoadingEmployee] = useState(false);
  const [employeeLoadError, setEmployeeLoadError] = useState<string | null>(null);

  const { values, errors, setErrors, setField, loadValues, resetForm } = useOnboardingForm();

  function handleStageOneChange<K extends keyof typeof values>(field: K, value: (typeof values)[K]) {
    setField(field, value);
    if (field === 'requestType') {
      setSelectedEmployee(null);
      setEmployeeLoadError(null);
    }
  }

  useEffect(() => {
    getFormCatalog()
      .then(setCatalog)
      .catch(() => setCatalogError('Could not load the request form. Refresh the page to try again.'));
  }, []);

  async function goToNextStage() {
    if (!catalog) return;

    if (stage === 1) {
      const stageErrors = validateStageOne(values);
      setErrors(stageErrors);
      if (Object.keys(stageErrors).length > 0) return;
      setStage(2);
      return;
    }

    if (stage === 2) {
      if (values.requestType === 'NEW_HIRE') {
        const stageErrors = validateStageTwo(values, catalog);
        setErrors(stageErrors);
        if (Object.keys(stageErrors).length === 0) setStage(3);
        return;
      }

      if (values.requestType === 'LEAVING_COMPANY') {
        if (!selectedEmployee) return;
        setStage(3);
        return;
      }

      if (values.requestType === 'UPDATE_EMPLOYEE_INFO') {
        if (!selectedEmployee) return;
        setIsLoadingEmployee(true);
        setEmployeeLoadError(null);
        try {
          const record = await getEmployeeSubmission(selectedEmployee.id);
          loadValues(record.submission);
          setStage(3);
        } catch (error) {
          setEmployeeLoadError(error instanceof ApiError ? error.message : 'Could not load this employee\u2019s information. Please try again.');
        } finally {
          setIsLoadingEmployee(false);
        }
      }
    }
  }

  function goToPreviousStage() {
    setSubmitError(null);
    setStage((current) => (current === 1 ? current : ((current - 1) as WizardStage)));
  }

  async function handleSubmit() {
    if (!catalog) return;

    if (values.requestType === 'NEW_HIRE') {
      const stageErrors = validateStageThree(values, catalog);
      setErrors(stageErrors);
      if (Object.keys(stageErrors).length > 0) return;

      setSubmitError(null);
      setIsSubmitting(true);
      try {
        const result = await submitOnboardingForm(values);
        setConfirmation({
          requestCode: result.requestCode,
          title: 'Information submitted',
          message: 'Thank you. Your onboarding information has been successfully submitted. Account information will be sent to the employee once the request has been processed.',
        });
      } catch (error) {
        if (error instanceof ApiError && error.payload.errors) {
          setErrors(error.payload.errors);
          setSubmitError('Please correct the highlighted fields and try again.');
        } else {
          setSubmitError('Something went wrong submitting the request. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (values.requestType === 'LEAVING_COMPANY') {
      if (!selectedEmployee) return;
      setSubmitError(null);
      setIsSubmitting(true);
      try {
        const result = await offboardEmployee(selectedEmployee.id);
        setConfirmation({
          requestCode: result.requestCode,
          title: 'Offboarding sent to the Auditor',
          message: `${selectedEmployee.nameAndSurname}'s offboarding request has been sent to the Auditor for review.`,
        });
      } catch (error) {
        setSubmitError(error instanceof ApiError ? error.message : 'Something went wrong sending this offboarding request. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (values.requestType === 'UPDATE_EMPLOYEE_INFO') {
      if (!selectedEmployee) return;
      const stageErrors = validateStageTwo(values, catalog);
      setErrors(stageErrors);
      if (Object.keys(stageErrors).length > 0) return;

      setSubmitError(null);
      setIsSubmitting(true);
      try {
        await updateEmployeeInfo(selectedEmployee.id, values);
        setConfirmation({
          title: 'Employee information updated',
          message: `${values.nameAndSurname}'s record has been updated. The Auditor will see this change in the audit log.`,
        });
      } catch (error) {
        if (error instanceof ApiError && error.payload.errors) {
          setErrors(error.payload.errors);
          setSubmitError('Please correct the highlighted fields and try again.');
        } else {
          setSubmitError(error instanceof ApiError ? error.message : 'Something went wrong saving this update. Please try again.');
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function startNewRequest() {
    setConfirmation(null);
    setSelectedEmployee(null);
    resetForm();
    setStage(1);
  }

  if (catalogError) {
    return (
      <main className="hr-page">
        <div className="notice notice-error hr-form-message">{catalogError}</div>
      </main>
    );
  }

  if (!catalog) {
    return (
      <main className="hr-page">
        <div className="skeleton hr-form-loading" />
      </main>
    );
  }

  if (confirmation) {
    return (
      <main className="hr-page">
        <div className="hr-confirmation">
          <SubmissionConfirmation requestCode={confirmation.requestCode} title={confirmation.title} message={confirmation.message} />
          <button type="button" className="btn btn-ghost" style={{ marginTop: 16 }} onClick={startNewRequest}>
            Start another request
          </button>
        </div>
      </main>
    );
  }

  const stages = STAGE_TITLES;
  const isFindEmployeeStage = stage === 2 && (values.requestType === 'LEAVING_COMPANY' || values.requestType === 'UPDATE_EMPLOYEE_INFO');
  const canAdvanceFromStage2 = values.requestType === 'NEW_HIRE' ? true : Boolean(selectedEmployee);

  return (
    <main className="hr-page">
      <div className="hr-form-shell">
        <aside className="hr-form-rail">
          <div>
            <div className="brand-lockup">
              <span className="brand-mark" aria-hidden>AZ</span>
              <span>
                <span className="brand-name">Access operations</span>
                <span className="brand-subtitle">InsideMaps</span>
              </span>
            </div>
            <h1>Send the right details once.</h1>
            <p>
              This request gives the Auditor everything needed to review the employee&rsquo;s access.
            </p>
          </div>
          <div className="hr-form-rail-note">
            <strong>Access is still reviewed by an Auditor.</strong>
            The form records the request; it does not grant permissions.
          </div>
        </aside>

        <section className="hr-form-content">
          <header className="hr-form-header">
            <div>
              <span className="text-muted text-sm">New HR request</span>
              <h2>Employee access request</h2>
              <p>Complete the details below. You can review everything before sending.</p>
            </div>
            <span className="form-stage-count">Step {stage} of 3</span>
          </header>

          <StageIndicator currentStage={stage} stages={stages} />

          <div className="hr-form-card">
            {stage === 1 && <StageOneRequest values={values} errors={errors} catalog={catalog} onChange={handleStageOneChange} />}

            {stage === 2 && values.requestType === 'NEW_HIRE' && (
              <StageTwoPlacement values={values} errors={errors} catalog={catalog} onChange={setField} />
            )}

            {isFindEmployeeStage && (
              <>
                <EmployeeSearchStage
                  title={values.requestType === 'LEAVING_COMPANY' ? 'Find the employee who is leaving' : 'Find the employee to update'}
                  description={
                    values.requestType === 'LEAVING_COMPANY'
                      ? 'Search by private email or work (Zoho) email, then select the employee to send an offboarding request to the Auditor.'
                      : 'Search by private email or work (Zoho) email, select the employee, then continue to update their information.'
                  }
                  selected={selectedEmployee}
                  onSelect={setSelectedEmployee}
                />
                {employeeLoadError && <div className="notice notice-error" style={{ marginTop: 16 }}>{employeeLoadError}</div>}
              </>
            )}

            {stage === 3 && values.requestType === 'NEW_HIRE' && (
              <StageThreeReview
                values={values}
                errors={errors}
                catalog={catalog}
                onChange={setField}
                onEditStage={(targetStage) => setStage(targetStage)}
              />
            )}

            {stage === 3 && values.requestType === 'LEAVING_COMPANY' && selectedEmployee && (
              <OffboardingReviewStage employee={selectedEmployee} />
            )}

            {stage === 3 && values.requestType === 'UPDATE_EMPLOYEE_INFO' && (
              <UpdateEmployeeStage values={values} errors={errors} catalog={catalog} onChange={setField} />
            )}

            {submitError && <div className="notice notice-error" style={{ marginTop: 20 }}>{submitError}</div>}

            <div className="wizard-actions">
              <button type="button" className="btn btn-ghost" onClick={goToPreviousStage} disabled={stage === 1 || isSubmitting}>
                {stage === 1 ? 'Start here' : 'Back'}
              </button>

              {stage < 3 ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={goToNextStage}
                  disabled={isLoadingEmployee || (stage === 2 && !canAdvanceFromStage2)}
                >
                  {isLoadingEmployee ? 'Loading…' : 'Continue'}
                </button>
              ) : (
                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting
                    ? 'Sending…'
                    : values.requestType === 'LEAVING_COMPANY'
                      ? 'Send to Auditor'
                      : values.requestType === 'UPDATE_EMPLOYEE_INFO'
                        ? 'Save changes'
                        : 'Send HR request'}
                </button>
              )}
            </div>
          </div>

          <p className="text-faint text-sm hr-form-footnote">Required questions are marked with an asterisk.</p>
        </section>
      </div>
    </main>
  );
}
