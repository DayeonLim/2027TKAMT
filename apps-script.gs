// ── 2027TKAMT interest-form backend ──
// 1. Create a NEW Google Sheet (this is the "new sheet" the form saves to).
// 2. Extensions → Apps Script → paste this entire file.
// 3. Deploy → New deployment → Web App (Execute as: Me, Access: Anyone).
// 4. Copy the deployment /exec URL into script.js → APPS_SCRIPT_URL.
// The script auto-creates a tab named below on first submission.

const SHEET_NAME = '2027TKAMT Signups';

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);

  // Add header row if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'School', 'Role', 'Est. Teams', 'Heard From']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#0e225a').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }

  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  sheet.appendRow([
    data.timestamp || new Date().toISOString(),
    data.name    || '',
    data.email   || '',
    data.school  || '',
    data.role    || '',
    data.teams   || '',
    data.hear    || ''
  ]);

  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// Optional: GET handler lets you check it's live
function doGet() {
  return ContentService.createTextOutput('TKAMT signup endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}
