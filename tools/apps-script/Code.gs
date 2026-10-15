/**
 * Kajal & Co. — contact form endpoint
 * ---------------------------------------------------------------------------
 * Receives a submission from the website contact form, appends it as a row to
 * the enquiries sheet, and emails a copy so a lead is never only in a tab
 * nobody has open.
 *
 * DEPLOY
 *   1. Open the enquiries spreadsheet → Extensions → Apps Script.
 *   2. Replace Code.gs with this file. Save.
 *   3. Run `setup` once from the editor and accept the permission prompt.
 *      It creates the header row if the sheet is empty, so the columns always
 *      match what doPost writes.
 *   4. Deploy → New deployment → type "Web app".
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      "Anyone" is required — the website posts without a Google login. The
 *      script only ever appends; it never reads the sheet back out.
 *   5. Copy the /exec URL and paste it into ENDPOINT in assets/js/main.js.
 *
 * Re-deploy as a NEW VERSION after any edit here, or the live URL keeps
 * running the old code.
 */

var SHEET_NAME = 'Enquiries';
var NOTIFY = 'kajalandani.co@gmail.com';

var COLUMNS = [
  'Timestamp',
  'Name',
  'Email',
  'Country Code',
  'WhatsApp',
  'Services',
  'Message',
  'Marketing Consent',
  'Source Page',
];

/** Run once from the editor to grant permissions and lay down the header. */
function setup() {
  var sheet = targetSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS);
    sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  Logger.log('Ready. Sheet "%s" has %s rows.', sheet.getName(), sheet.getLastRow());
}

function targetSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  return book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
}

function doPost(e) {
  try {
    var form = (e && e.parameter) || {};

    // Honeypot: a real person never sees this field, so anything in it is a bot.
    // Answer 200 so the bot does not learn it was filtered.
    if (form.company) {
      return json({ ok: true });
    }

    var name = String(form.name || '').trim();
    var email = String(form.email || '').trim();
    if (!name || !email) {
      return json({ ok: false, error: 'Name and email are required.' });
    }

    // One submission at a time, so two arriving together cannot land on the
    // same row.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sheet = targetSheet();
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(COLUMNS);
        sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
        sheet.setFrozenRows(1);
      }
      sheet.appendRow([
        new Date(),
        name,
        email,
        String(form.country_code || ''),
        String(form.whatsapp || ''),
        String(form.services || ''),
        String(form.message || ''),
        form.marketing_consent === 'yes' ? 'Yes' : 'No',
        String(form.source || ''),
      ]);
    } finally {
      lock.releaseLock();
    }

    notify(form, name, email);
    return json({ ok: true });
  } catch (err) {
    // The row may already be in; surface the failure rather than reporting a
    // success the visitor cannot verify.
    return json({ ok: false, error: String(err) });
  }
}

function notify(form, name, email) {
  try {
    var lines = [
      'Name: ' + name,
      'Email: ' + email,
      'WhatsApp: ' + (form.country_code || '') + ' ' + (form.whatsapp || ''),
      'Services: ' + (form.services || '—'),
      'Marketing consent: ' + (form.marketing_consent === 'yes' ? 'Yes' : 'No'),
      'Page: ' + (form.source || '—'),
      '',
      'Message:',
      form.message || '—',
    ];
    MailApp.sendEmail({
      to: NOTIFY,
      replyTo: email,
      subject: 'New enquiry — ' + name,
      body: lines.join('\n'),
    });
  } catch (err) {
    // A failed notification must not lose the row that is already saved.
    Logger.log('notify failed: %s', err);
  }
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
