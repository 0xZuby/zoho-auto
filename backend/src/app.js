import express from 'express';
import cors from 'cors';
import { ObjectId } from 'mongodb';
import { auditorConfigurationFields, validateAuditorConfiguration, validateAuditorConfigurationPatch, validateSubmission, validateSubmissionPatch } from './validation.js';

const clean = (value) => typeof value === 'string' ? value.trim() : value;
const submissionFields = ['nameAndSurname', 'privateEmail', 'country', 'department', 'jobPosition', 'githubProfile', 'githubRepos'];
const emptyConfiguration = () => Object.fromEntries(auditorConfigurationFields.map((field) => [field, '']));

export function createApp(collection, { emailDomain = 'example.company' } = {}) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.post('/api/onboarding-requests', async (req, res, next) => {
    try {
      const errors = validateSubmission(req.body);
      if (Object.keys(errors).length) return res.status(422).json({ error: 'Validation failed.', errors });
      const submission = Object.fromEntries(submissionFields.map((field) => [field, clean(req.body[field] ?? '')]));
      const submittedAt = new Date();
      const document = {
        requestCode: `ONB-${submittedAt.getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        submission, auditorConfiguration: emptyConfiguration(), submittedAt, status: 'PENDING_REVIEW', provisioning: null,
        auditEvents: [{ at: submittedAt, action: 'FORM_SUBMITTED', detail: 'Onboarding form submitted.' }]
      };
      const result = await collection.insertOne(document);
      res.status(201).json({ id: result.insertedId.toString(), requestCode: document.requestCode, submittedAt });
    } catch (error) { next(error); }
  });

  app.get('/api/onboarding-requests', async (_req, res, next) => {
    try {
      const requests = await collection.find({}, { projection: { requestCode: 1, status: 1, submittedAt: 1 } }).sort({ submittedAt: -1 }).toArray();
      res.json(requests.map(({ _id, requestCode, status, submittedAt }) => ({ id: _id.toString(), requestCode, status, submittedAt })));
    } catch (error) { next(error); }
  });

  app.get('/api/auditor/employees', async (_req, res, next) => {
    try {
      const requests = await collection.find({}).sort({ submittedAt: -1 }).toArray();
      res.json(requests.map(serialize));
    } catch (error) { next(error); }
  });

  app.get('/api/onboarding-requests/:id', async (req, res, next) => {
    try {
      if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Request not found.' });
      const request = await collection.findOne({ _id: new ObjectId(req.params.id) });
      if (!request) return res.status(404).json({ error: 'Request not found.' });
      res.json(serialize(request));
    } catch (error) { next(error); }
  });

  app.patch('/api/onboarding-requests/:id/configuration', async (req, res, next) => {
    try {
      if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Request not found.' });
      const errors = validateAuditorConfiguration(req.body);
      if (Object.keys(errors).length) return res.status(422).json({ error: 'Validation failed.', errors });
      const _id = new ObjectId(req.params.id);
      const configuration = Object.fromEntries(auditorConfigurationFields.map((field) => [field, clean(req.body[field]) ]));
      const event = { at: new Date(), action: 'AUDITOR_CONFIGURATION_SAVED', detail: 'Auditor account setup saved.' };
      const result = await collection.updateOne({ _id }, { $set: { auditorConfiguration: configuration }, $push: { auditEvents: event } });
      if (!result.matchedCount) return res.status(404).json({ error: 'Request not found.' });
      res.json(serialize(await collection.findOne({ _id })));
    } catch (error) { next(error); }
  });

  app.patch('/api/onboarding-requests/:id', async (req, res, next) => {
    try {
      if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Request not found.' });
      const _id = new ObjectId(req.params.id);
      const existing = await collection.findOne({ _id });
      if (!existing) return res.status(404).json({ error: 'Request not found.' });
      const submission = { ...(existing.submission || {}), ...(req.body.submission || {}) };
      const configuration = { ...(existing.auditorConfiguration || {}), ...(req.body.auditorConfiguration || {}) };
      const submissionErrors = validateSubmissionPatch(submission);
      const configurationErrors = validateAuditorConfigurationPatch(configuration);
      const errors = { ...submissionErrors, ...configurationErrors };
      if (Object.keys(errors).length) return res.status(422).json({ error: 'Validation failed.', errors });
      const cleanedSubmission = Object.fromEntries(submissionFields.map((field) => [field, clean(submission[field] ?? '')]));
      const cleanedConfiguration = Object.fromEntries(auditorConfigurationFields.map((field) => [field, clean(configuration[field] ?? '')]));
      const event = { at: new Date(), action: 'AUDITOR_RECORD_UPDATED', detail: 'Employee onboarding record updated by auditor.' };
      const result = await collection.updateOne({ _id }, { $set: { submission: cleanedSubmission, auditorConfiguration: cleanedConfiguration }, $push: { auditEvents: event } });
      if (!result.matchedCount) return res.status(404).json({ error: 'Request not found.' });
      res.json(serialize(await collection.findOne({ _id })));
    } catch (error) { next(error); }
  });

  app.post('/api/onboarding-requests/:id/provision', async (req, res, next) => {
    try {
      if (!ObjectId.isValid(req.params.id)) return res.status(404).json({ error: 'Request not found.' });
      const _id = new ObjectId(req.params.id);
      const existing = await collection.findOne({ _id });
      if (!existing) return res.status(404).json({ error: 'Request not found.' });
      if (existing.provisioning?.completedAt) return res.json({ request: serialize(existing), alreadyProvisioned: true });
      const errors = { ...validateSubmission(existing.submission || {}), ...validateAuditorConfiguration(existing.auditorConfiguration || {}) };
      if (Object.keys(errors).length) return res.status(422).json({ error: 'Complete the employee record and account setup before provisioning.', errors });
      const completedAt = new Date();
      const corporateEmail = existing.auditorConfiguration.emailAddress;
      const provisioning = { corporateEmail, completedAt, simulated: true };
      const event = { at: completedAt, action: 'ZOHO_USER_SIMULATED', detail: `Simulated Zoho user created: ${corporateEmail}` };
      await collection.updateOne({ _id, 'provisioning.completedAt': { $exists: false } }, { $set: { status: 'COMPLETED', provisioning }, $push: { auditEvents: event } });
      const updated = await collection.findOne({ _id });
      res.json({ request: serialize(updated), alreadyProvisioned: false });
    } catch (error) { next(error); }
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  });
  return app;
}

function corporateEmailFor(name, domain) {
  const local = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '');
  return `${local || 'new.employee'}@${domain}`;
}

function serialize(document) { return { ...document, auditorConfiguration: { ...emptyConfiguration(), ...(document.auditorConfiguration || {}) }, id: document._id.toString(), _id: undefined }; }
