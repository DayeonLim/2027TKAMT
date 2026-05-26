// Paste this entire file into Google Apps Script (Extensions → Apps Script)
// then deploy as a Web App (Execute as: Me, Access: Anyone).
// Copy the deployment URL into script.js → APPS_SCRIPT_URL

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TKAMT Signups')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('TKAMT Signups');

  // Add header row if empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'School', 'Role', 'Est. Teams', 'Heard From']);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#0d1b2e').setFontColor('#ffffff');
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
