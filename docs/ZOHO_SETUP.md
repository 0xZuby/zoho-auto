# Zoho Mail Live Setup Guide

Goal: let the portal create Zoho Mail accounts (`ZOHO_MODE=live`).

## Admin one-click connection

The portal supports an administrator OAuth connection at `/auditor/integrations/zoho`. Keep the app in its default simulated mode until an administrator connects the Zoho organization; after consent, provisioning uses the saved OAuth refresh token automatically. The token is encrypted before it is saved in the backend data directory.

One-time setup by the app operator:

1. Register a **Server-based Application** in the Zoho API Console.
2. Add the exact redirect URI `https://<portal-host>/api/admin/zoho/callback` (locally: `http://localhost:3000/api/admin/zoho/callback`).
3. Set `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_OAUTH_REDIRECT_URI`, `ZOHO_TOKEN_ENCRYPTION_KEY`, `ZOHO_ORG_ID`, `ZOHO_DC`, and `FRONTEND_URL` in the backend environment. Generate the encryption key with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and keep it stable; changing it prevents decryption of the saved token.
4. Ensure the callback URL is reachable through the portal's `/api/*` proxy and that the connected Zoho user is an administrator of the configured Mail organization.
5. Sign in as a portal Administrator, open **Zoho integration**, and click **Connect Zoho Mail**. Review and approve the requested `ZohoMail.organization.accounts.ALL` permission in Zoho.

The portal stores the refresh token encrypted in `DATA_DIR/zoho_credentials.json`. Back up that data directory and the encryption key together. Reconnecting replaces the saved token. Revocation must be performed from Zoho account permissions; the portal does not currently offer a disconnect control.
Client type: **Server-based Application**. Data center: **`.com`**.

> Never commit secrets. Keep them only in `backend/.env` (gitignored).

## Prerequisites

- A Zoho Mail **super admin** account (used for authorization).
- The email domain (e.g. `insidemaps.com`) added and verified in Zoho Mail.
- Free user seats on the Zoho Mail plan.
- Any groups/roles referenced by `backend/src/config/rules.js` already exist in Zoho.

## Step 1 - Register the client

1. Go to <https://api-console.zoho.com> and sign in as the admin.
2. **Add Client -> Server-based Applications**.
3. Set a name (e.g. "Onboarding Portal"), homepage URL, and an **Authorized Redirect URI**
   (e.g. `https://<your-ngrok-domain>/oauth/callback`). The page does not need to exist;
   you only read the `code` from the browser address bar.
4. Copy the **Client ID** and **Client Secret**.

## Step 2 - Get the authorization code (valid 1 minute)

Open this URL in a browser while signed in as the super admin
(replace the placeholders; URL-encode the redirect URI):

```
https://accounts.zoho.com/oauth/v2/auth?response_type=code&client_id=<CLIENT_ID>&scope=ZohoMail.organization.accounts.ALL&redirect_uri=<REDIRECT_URI>&access_type=offline&prompt=consent
```

Click **Accept**. You are redirected to:

```
<REDIRECT_URI>?code=1000.xxxxxxxx&location=us&accounts-server=https://accounts.zoho.com
```

Copy the `code` value immediately.

## Step 3 - Exchange the code for tokens

Run right away (code expires in 1 minute):

```powershell
curl.exe -X POST "https://accounts.zoho.com/oauth/v2/token" `
  -d "grant_type=authorization_code" `
  -d "client_id=<CLIENT_ID>" `
  -d "client_secret=<CLIENT_SECRET>" `
  -d "redirect_uri=<REDIRECT_URI>" `
  -d "code=<CODE>"
```

The response contains `access_token` (1 hour) and `refresh_token` (does not expire).
**Save the refresh token** - it is only returned the first time. If lost, repeat Step 2.

## Step 4 - Get the organization ID (zoid)

```powershell
curl.exe "https://mail.zoho.com/api/organization" `
  -H "Authorization: Zoho-oauthtoken <ACCESS_TOKEN>"
```

Use `data.zoid` from the response. It is also shown in
Mail Admin Console -> Organization Profile.

## Step 5 - Configure the backend

Edit `backend/.env`:

```
ZOHO_MODE=live
ZOHO_DC=com
ZOHO_ORG_ID=<zoid>
ZOHO_CLIENT_ID=<client id>
ZOHO_CLIENT_SECRET=<client secret>
ZOHO_REFRESH_TOKEN=<refresh token>

# Optional: real notification emails
MAIL_MODE=smtp
MAIL_FROM=IT Provisioning <it@insidemaps.com>
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=<mailbox>
SMTP_PASS=<app-specific password>
```

Restart the API (`npm run dev:api`). The server refuses to start in live mode if any
required `ZOHO_*` value is empty.

## Step 6 - Test

1. Submit one dummy request (Google Form webhook or auditor UI).
2. As an auditor: review the proposal, save the resolved account, then provision.
3. Confirm the mailbox exists in Zoho Mail Admin Console -> Users.
4. Delete the dummy account afterwards.

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `invalid_client` | Wrong data center or client ID/secret. Use `.com` URLs everywhere. |
| `invalid_code` | Code expired (1 min) or `redirect_uri` differs from the registered one. Redo Step 2. |
| No `refresh_token` in response | Missing `access_type=offline`. Redo Step 2 with `prompt=consent`. |
| `INVALID_OAUTHSCOPE` / 401 on create | Token lacks `ZohoMail.organization.accounts.ALL`, or user is not a super admin. |
| Domain / seat errors | Domain not verified or no free licenses. |
| Webhook `422` | Validation failure; read the response body in the ngrok inspector (`http://127.0.0.1:4040`). |

## Security notes

- Rotate the client secret if it was ever shared in chat or email.
- Only `resolvedAccount` (approved by an auditor/admin) is ever sent to Zoho.
