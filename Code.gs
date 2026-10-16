/**
 * Autometrik website – Book a Demo → email to inquiry@autoshop.ph
 *
 * Setup (once):
 *   1. Go to https://script.google.com → New project, paste this file, save.
 *   2. Deploy → New deployment → Type: Web app
 *        Execute as: Me
 *        Who has access: Anyone
 *   3. Authorize when asked (allows the script to send email as you).
 *   4. Copy the Web app URL (ends in /exec) into GOOGLE_SCRIPT_URL in the website.
 *
 * Emails are sent from the Google account that deployed the script.
 */

const TO = 'inquiry@autoshop.ph';
const SENDER_NAME = 'Autometrik Website';

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Spam trap: real visitors never see or fill the hidden "website" field.
  if (clean_(p.website)) return json_({ ok: true });

  const d = {
    name:   clean_(p.name),
    shop:   clean_(p.shop),
    mobile: clean_(p.mobile),
    type:   clean_(p.type),
    other:  clean_(p.other),
    page:   clean_(p.page)
  };

  if (!d.name || !d.mobile || !d.type) {
    return json_({ ok: false, error: 'Missing required fields' });
  }

  const shopType = d.type === 'Other' && d.other ? 'Other: ' + d.other : d.type;
  const subject = 'Demo request: ' + (d.shop || d.name) + ' (' + shopType + ')';
  const received = Utilities.formatDate(new Date(), 'Asia/Manila', 'MMM d, yyyy h:mm a');

  const rows = [
    ['Name', d.name],
    ['Shop name', d.shop || '—'],
    ['Mobile number', d.mobile],
    ['Type of shop', shopType],
    ['Received', received + ' (PH time)'],
    ['Sent from', d.page || '—']
  ];

  const body = 'New demo request from the Autometrik website\n\n' +
    rows.map(function (r) { return r[0] + ': ' + r[1]; }).join('\n');

  const htmlBody =
    '<p style="font-family:Arial,sans-serif;font-size:15px">New demo request from the Autometrik website</p>' +
    '<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">' +
    rows.map(function (r) {
      return '<tr><td style="padding:6px 14px 6px 0;color:#5b6472">' + esc_(r[0]) +
             '</td><td style="padding:6px 0;font-weight:bold;color:#1f2430">' + esc_(r[1]) + '</td></tr>';
    }).join('') +
    '</table>';

  MailApp.sendEmail({
    to: TO,
    subject: subject,
    body: body,
    htmlBody: htmlBody,
    name: SENDER_NAME
  });

  return json_({ ok: true });
}

// Opening the /exec URL in a browser shows this, so you can confirm the deployment works.
function doGet() {
  return json_({ ok: true, message: 'Autometrik demo request endpoint is running.' });
}

function clean_(value) {
  return String(value == null ? '' : value).replace(/[\r\n]+/g, ' ').trim().slice(0, 200);
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
