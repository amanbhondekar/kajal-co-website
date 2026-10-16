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
 *   1. Open the Apps Script editor (Extensions → Apps Script from any of your
 *      spreadsheets, or script.google.com). Replace Code.gs with this. Save.
 *      The destination is SPREADSHEET_ID below, not whichever file the editor
 *      was opened from.
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
 * old code. Open the /exec URL in a browser afterwards: doGet answers with the
 * VERSION below, which is the only way to tell the deployed code from the
 * saved code without writing a row.
 */

/* The destination workbook, named outright rather than taken from whichever
   spreadsheet the script happens to be bound to. A bound script follows the
   file it was created in, so moving the destination would otherwise mean
   rebuilding the script; with the id here, it is one line. */
/* Bump this when editing, so the health check tells you whether the version
   you deployed is the version that is live. */
var VERSION = '2026-10-16a';

var SPREADSHEET_ID = '1gz1fVQ0qq-yVadhsp2SDvlEocwfn_hyesYqwtD-omQU';  // K&Co Submissions
var SHEET_NAME = 'Contact Form';
var NOTIFY = 'kajalandani.co@gmail.com';

/* The form posts one `service` value per ticked box, so a submission can name
   several. Two layouts are supported and the script fills whichever the tab
   actually has, because placement is by header name and an unrecognised key is
   skipped:

     - one boolean column per service ("Contact Form")
     - a single "Services" column holding the labels, comma separated ("New")

   A tab carrying both gets both filled, which is harmless. */
var SERVICE_COLUMNS = {
  'website-design': 'Website Design & Development',
  'performance-marketing': 'Performance Marketing',
  'seo': 'SEO Search Engine Optimization',
  'other': 'Other',
};
var SERVICES_COLUMN = 'Services';

/* The consent record the privacy policy commits to keeping, plus the page the
   enquiry came from. Added to the sheet only if they are not already there. */
var EXTRA_COLUMNS = ['Marketing Consent', 'Source Page'];

function targetSheet() {
  var book;
  try {
    book = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    throw new Error('Cannot open spreadsheet ' + SPREADSHEET_ID + '. Check the ' +
                    'id and that this account can edit it. (' + err + ')');
  }
  var sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('No tab named "' + SHEET_NAME + '" in "' + book.getName() +
                    '". Rename the tab, or change SHEET_NAME to match it.');
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
  var core = ['Submission Date', 'Name', 'Email', 'Country Code',
              'WhatsApp Number', 'Message', 'Book Your Call'].concat(EXTRA_COLUMNS);
  var serviceCols = Object.keys(SERVICE_COLUMNS)
    .map(function (k) { return SERVICE_COLUMNS[k]; });

  // either service layout counts as present, so only flag a tab with neither
  var hasSingle = !!map[SERVICES_COLUMN];
  var hasBoolean = serviceCols.some(function (n) { return !!map[n]; });
  var wanted = core.concat(hasSingle ? [SERVICES_COLUMN] : serviceCols);

  var missing = wanted.filter(function (name) { return !map[name]; });
  if (!hasSingle && !hasBoolean) {
    missing.push('(no service columns at all — expected "' + SERVICES_COLUMN +
                 '" or the four per-service columns)');
  }
  Logger.log('Service layout: %s', hasSingle ? 'single "Services" column'
    : hasBoolean ? 'one boolean column per service' : 'NONE FOUND');
  Logger.log('Sheet "%s", %s data row(s).', sheet.getName(), Math.max(0, sheet.getLastRow() - 1));
  Logger.log('Matched: %s', wanted.filter(function (n) { return map[n]; }).join(' | '));
  if (missing.length) {
    Logger.log('NOT FOUND (these will stay empty): %s', missing.join(' | '));
  } else {
    Logger.log('Every column matched.');
  }
}

/**
 * Health check. Open the /exec URL in a browser: a deployment running this
 * code answers with JSON naming the version, the tab and the layout it found.
 *
 * Without this, "is the right code live?" has no safe answer — an empty
 * project and a correctly deployed one both reject a GET with "Script function
 * not found: doGet", and the only other probe is a POST, which writes a row.
 */
function doGet() {
  var out = { ok: true, service: 'Kajal & Co. contact form', version: VERSION };
  try {
    var sheet = targetSheet();
    var map = headerMap(sheet);
    out.spreadsheet = sheet.getParent().getName();
    out.tab = sheet.getName();
    out.rows = Math.max(0, sheet.getLastRow() - 1);
    out.layout = map[SERVICES_COLUMN] ? 'single Services column'
      : map[SERVICE_COLUMNS['website-design']] ? 'one column per service'
      : 'no service columns found';
  } catch (err) {
    out.ok = false;
    out.error = String(err);
  }
  return json(out);
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
      // the single-column layout takes the labels, in the form's own order, so
      // the value matches the dropdown rather than carrying raw slugs
      values[SERVICES_COLUMN] = Object.keys(SERVICE_COLUMNS)
        .filter(function (key) { return picked.indexOf(key) !== -1; })
        .map(function (key) { return SERVICE_COLUMNS[key]; })
        .join(', ');

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
