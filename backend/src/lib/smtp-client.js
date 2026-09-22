import { connect as tlsConnect } from 'node:tls';
import { Socket } from 'node:net';

/**
 * Minimal STARTTLS SMTP client (PLAIN auth) built on Node's net/tls modules.
 * Sends exactly one plain-text message per call. This intentionally avoids
 * adding nodemailer as a dependency for a single, simple message shape; if
 * richer email (HTML, attachments, retries) is ever needed, swap this
 * module for nodemailer without touching any calling code.
 */
export function sendMailOverSmtp({ host, port, user, pass, from, to, subject, text }) {
  return new Promise((resolve, reject) => {
    if (!host) {
      reject(new Error('SMTP_HOST is not configured.'));
      return;
    }

    const socket = new Socket();
    let secureSocket = null;
    let step = 'connect';
    let buffer = '';

    const activeSocket = () => secureSocket ?? socket;

    function send(line) {
      activeSocket().write(`${line}\r\n`);
    }

    function fail(error) {
      try { activeSocket().destroy(); } catch { /* ignore */ }
      reject(error);
    }

    function onData(chunk) {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\r\n').filter(Boolean);
      const lastLine = lines[lines.length - 1] ?? '';
      // Multi-line SMTP replies use "250-" for continuation and "250 " for
      // the final line; wait until we see the final line before proceeding.
      if (/^\d{3}-/.test(lastLine)) return;
      buffer = '';
      const code = Number(lastLine.slice(0, 3));
      handleReply(code, lines);
    }

    function handleReply(code, lines) {
      switch (step) {
        case 'connect':
          if (code !== 220) return fail(new Error(`Unexpected SMTP greeting: ${lines.join(' ')}`));
          step = 'ehlo';
          send(`EHLO ${host}`);
          break;
        case 'ehlo':
          if (code !== 250) return fail(new Error(`EHLO failed: ${lines.join(' ')}`));
          if (secureSocket) {
            step = 'auth';
            send('AUTH LOGIN');
          } else {
            step = 'starttls';
            send('STARTTLS');
          }
          break;
        case 'starttls':
          if (code !== 220) return fail(new Error(`STARTTLS failed: ${lines.join(' ')}`));
          secureSocket = tlsConnect({ socket, servername: host }, () => {
            secureSocket.on('data', onData);
            step = 'ehlo';
            send(`EHLO ${host}`);
          });
          secureSocket.on('error', fail);
          break;
        case 'auth':
          if (code !== 334) return fail(new Error(`AUTH LOGIN failed: ${lines.join(' ')}`));
          step = 'auth-user';
          send(Buffer.from(user ?? '').toString('base64'));
          break;
        case 'auth-user':
          if (code !== 334) return fail(new Error(`SMTP auth username rejected: ${lines.join(' ')}`));
          step = 'auth-pass';
          send(Buffer.from(pass ?? '').toString('base64'));
          break;
        case 'auth-pass':
          if (code !== 235) return fail(new Error(`SMTP authentication failed: ${lines.join(' ')}`));
          step = 'mail-from';
          send(`MAIL FROM:<${extractAddress(from)}>`);
          break;
        case 'mail-from':
          if (code !== 250) return fail(new Error(`MAIL FROM rejected: ${lines.join(' ')}`));
          step = 'rcpt-to';
          send(`RCPT TO:<${extractAddress(to)}>`);
          break;
        case 'rcpt-to':
          if (code !== 250 && code !== 251) return fail(new Error(`RCPT TO rejected: ${lines.join(' ')}`));
          step = 'data';
          send('DATA');
          break;
        case 'data':
          if (code !== 354) return fail(new Error(`DATA command rejected: ${lines.join(' ')}`));
          step = 'body';
          activeSocket().write(buildMessage({ from, to, subject, text }));
          break;
        case 'body':
          if (code !== 250) return fail(new Error(`Message rejected by SMTP server: ${lines.join(' ')}`));
          step = 'quit';
          send('QUIT');
          resolve({ delivered: true });
          break;
        default:
          break;
      }
    }

    socket.on('data', (chunk) => {
      if (!secureSocket) onData(chunk);
    });
    socket.on('error', fail);
    socket.connect(port, host);
  });
}

function extractAddress(value) {
  const match = String(value).match(/<([^>]+)>/);
  return match ? match[1] : String(value).trim();
}

function buildMessage({ from, to, subject, text }) {
  const header = [`From: ${from}`, `To: ${to}`, `Subject: ${subject}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset=utf-8', ''].join('\r\n');
  // Dot-stuff any line that starts with a lone "." per RFC 5321 4.5.2.
  const stuffedBody = text.replace(/^\./gm, '..');
  return `${header}\r\n${stuffedBody}\r\n.\r\n`;
}
