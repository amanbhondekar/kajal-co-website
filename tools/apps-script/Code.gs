/**
 * Kajal & Co. — contact form endpoint
 * ---------------------------------------------------------------------------
 * Receives a submission from the website contact form, appends it to the
 * "Contact Form" tab, and emails a copy so a lead is never only in a tab
 * nobody has open.
 *
 * Values are placed by HEADER NAME, not by position. The sheet already had its
 * own columns and its own order before this script existed, so reordering or
 * inserting a column there will not start writing names into the message
 * column. A header this script does not recognise is left alone.
 *
 * DEPLOY
 *   1. Spreadsheet → Extensions → Apps Script. Replace Code.gs with this. Save.
 *   2. Run `setup` once and accept the permission prompt. It reports which
 *      columns it matched and adds the two consent/source columns if missing.
 *   3. Deploy → New deployment → Web app.
 *        Execute as:      Me
 *        Who has access:  Anyone
 *      "Anyone" is required — the website posts without a Google login. The
 *      script only appends; it never reads the sheet back out to the caller.
 *   4. Copy the /exec URL into ENDPOINT in assets/js/main.js.
 *
 * Re-deploy as a NEW VERSION after editing, or the live URL keeps running the
 * old code.
 */

var SHEET_NAME = 'Contact Form';
var NOTIFY = 'kajalandani.co@gmail.com';

/* The form posts one `service` value per ticked box. Each maps to its own
   column, matching how the sheet was set up. */
var SERVICE_COLUMNS = {
  'website-design': 'Website Design & Development',
  'performance-marketing': 'Performance Marketing',
  'seo': 'SEO Search Engine Optimization',
  'other': 'Other',
};

/* The consent record the privacy policy commits to keeping, plus the page the
   enquiry came from. Added to the sheet only if they are not already there. */
var EXTRA_COLUMNS = ['Marketing Consent', 'Source Page'];

function targetSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('No sheet named "' + SHEET_NAME + '". Rename the tab, or ' +
                    'change SHEET_NAME to match it.');
  }
  return sheet;
}

/** Map of header text -> 1-based column index. */
function headerMap(sheet) {
  var width = sheet.getLastColumn();
  if (!width) return {};
  var headers = sheet.getRange(1, 1, 1, width).getValues()[0];
  var map = {};
  headers.forEach(function (name, i) {
    name = String(name).trim();
    if (name) map[name] = i + 1;
  });
  return map;
}

/** Append the consent/source headers if the sheet does not have them yet. */
function ensureExtraColumns(sheet) {
  var map = headerMap(sheet);
  EXTRA_COLUMNS.forEach(function (name) {
    if (!map[name]) {
      var col = sheet.getLastColumn() + 1;
      sheet.getRange(1, col, 1, 1).setValue(name).setFontWeight('bold');
      map[name] = col;
    }
  });
  return map;
}

/** Run once from the editor: grants permissions and reports the mapping. */
function setup() {
  var sheet = targetSheet();
  var map = ensureExtraColumns(sheet);
  var wanted = ['Submission Date', 'Name', 'Email', 'Country Code',
                'WhatsApp Number', 'Message', 'Book Your Call']
    .concat(Object.keys(SERVICE_COLUMNS).map(function (k) { return SERVICE_COLUMNS[k]; }))
    .concat(EXTRA_COLUMNS);

  var missing = wanted.filter(function (name) { return !map[name]; });
  Logger.log('Sheet "%s", %s data row(s).', sheet.getName(), Math.max(0, sheet.getLastRow() - 1));
  Logger.log('Matched: %s', wanted.filter(function (n) { return map[n]; }).join(' | '));
  if (missing.length) {
    Logger.log('NOT FOUND (these will stay empty): %s', missing.join(' | '));
  } else {
    Logger.log('Every column matched.');
  }
}

function doPost(e) {
  try {
    var form = (e && e.parameter) || {};

    // Honeypot: a real person never sees this field. Answer 200 so the bot
    // does not learn it was filtered.
    if (form.company) return json({ ok: true });

    var name = String(form.name || '').trim();
    var email = String(form.email || '').trim();
    if (!name || !email) {
      return json({ ok: false, error: 'Name and email are required.' });
    }

    // One writer at a time, so two submissions cannot land on the same row.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sheet = targetSheet();
      var map = ensureExtraColumns(sheet);

      var picked = String(form.services || '')
        .split(',')
        .map(function (s) { return s.trim(); })
        .filter(String);

      var values = {
        'Submission Date': new Date(),
        'Name': name,
        'Email': email,
        'Country Code': String(form.country_code || ''),
        'WhatsApp Number': String(form.whatsapp || ''),
        'Message': String(form.message || ''),
        'Book Your Call': form.book_call === 'yes' ? 'Yes' : 'No',
        'Marketing Consent': form.marketing_consent === 'yes' ? 'Yes' : 'No',
        'Source Page': String(form.source || ''),
      };
      // the four service columns are checkboxes, so they take real booleans
      Object.keys(SERVICE_COLUMNS).forEach(function (key) {
        values[SERVICE_COLUMNS[key]] = picked.indexOf(key) !== -1;
      });

      var row = new Array(sheet.getLastColumn()).fill('');
      Object.keys(values).forEach(function (header) {
        var col = map[header];
        if (col) row[col - 1] = values[header];
      });
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    notify(form, name, email);
    return json({ ok: true });
  } catch (err) {
    // The row may already be in, so report the failure rather than a success
    // the visitor cannot verify.
    return json({ ok: false, error: String(err) });
  }
}

function notify(form, name, email) {
  try {
    MailApp.sendEmail({
      to: NOTIFY,
      replyTo: email,
      subject: 'New enquiry — ' + name,
      body: [
        'Name: ' + name,
        'Email: ' + email,
        'WhatsApp: ' + (form.country_code || '') + ' ' + (form.whatsapp || ''),
        'Services: ' + (form.services || '—'),
        'Wants a call: ' + (form.book_call === 'yes' ? 'Yes' : 'No'),
        'Marketing consent: ' + (form.marketing_consent === 'yes' ? 'Yes' : 'No'),
        'Page: ' + (form.source || '—'),
        '',
        'Message:',
        form.message || '—',
      ].join('\n'),
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
