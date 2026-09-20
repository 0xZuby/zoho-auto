import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { createApp } from './app.js';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is required. Copy .env.example to .env and configure MongoDB.');
const client = new MongoClient(uri);
await client.connect();
const db = client.db(process.env.MONGODB_DB || 'onboarding_prototype');
const app = createApp(db.collection('onboardingRequests'), { emailDomain: process.env.CORPORATE_EMAIL_DOMAIN || 'example.company' });
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`Onboarding API listening on http://localhost:${port}`));
