/**
 * GOOGLE APPS SCRIPT CMS BACKEND FOR PORTFOLIO
 * 
 * Instructions to deploy:
 * 1. Go to Google Drive -> New -> Google Sheets -> Name it "Portfolio Contacts"
 * 2. In the menu, go to Extensions -> Apps Script
 * 3. Paste this entire code into Code.gs, replacing the placeholder "INSERT_YOUR_SHEET_ID_HERE"
 *    with your actual Google Sheet ID (found in the sheet's URL between /d/ and /edit).
 * 4. Run the `init()` function once from the editor to automatically setup headers & permissions.
 * 5. Click Save (Ctrl+S or Cmd+S)
 * 6. Click the blue "Deploy" button at the top right -> New deployment
 * 7. Click the 'Select type' gear icon -> choose Web App
 * 8. Set the following:
 *    - Description: Portfolio V2 (Secure + Email)
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 9. Click Deploy. Authorize access if prompted (Advanced -> Go to script (unsafe)).
 * 10. Copy the "Web app URL" provided!
 * 11. Go back to your portfolio project and locate `js/main.js`.
 * 12. Replace the `SCRIPT_URL` variable with your copied Web app URL.
 */

const SHEET_ID = '1YCk13G6NTa1mMyp4lED8XCukUD-uGlVdSRSrY3odmow'; // Replace with your actual sheet ID
const SHEET_NAME = 'Submissions'; 

// ==========================================
// 1. INITIALIZATION & SETUP
// ==========================================
// Run this function ONCE from the Apps Script editor to setup the sheets
function init() {
  const doc = SpreadsheetApp.openById(SHEET_ID);
  
  // 1. Setup Submissions Sheet
  let subSheet = doc.getSheetByName(SHEET_NAME);
  if (!subSheet) { subSheet = doc.insertSheet(SHEET_NAME); }
  const subHeaders = ['Timestamp', 'Name', 'Email', 'Idea'];
  subSheet.getRange(1, 1, 1, subHeaders.length).setValues([subHeaders]);
  subSheet.getRange(1, 1, 1, subHeaders.length).setFontWeight("bold");
  
  // 2. Setup Projects Sheet
  let projSheet = doc.getSheetByName('Projects');
  if (!projSheet) { projSheet = doc.insertSheet('Projects'); }
  const projHeaders = ['Title', 'Tags', 'Problem', 'Solution', 'Impact', 'ImageUrl', 'DemoUrl'];
  projSheet.getRange(1, 1, 1, projHeaders.length).setValues([projHeaders]);
  projSheet.getRange(1, 1, 1, projHeaders.length).setFontWeight("bold");

  // 3. Setup Skills Sheet
  let skillsSheet = doc.getSheetByName('Skills');
  if (!skillsSheet) { skillsSheet = doc.insertSheet('Skills'); }
  const skillsHeaders = ['Title', 'Icon', 'Description'];
  skillsSheet.getRange(1, 1, 1, skillsHeaders.length).setValues([skillsHeaders]);
  skillsSheet.getRange(1, 1, 1, skillsHeaders.length).setFontWeight("bold");

  // 4. Setup Experience Sheet
  let expSheet = doc.getSheetByName('Experience');
  if (!expSheet) { expSheet = doc.insertSheet('Experience'); }
  const expHeaders = ['Date', 'Role', 'Description', 'Highlight'];
  expSheet.getRange(1, 1, 1, expHeaders.length).setValues([expHeaders]);
  expSheet.getRange(1, 1, 1, expHeaders.length).setFontWeight("bold");
  
  Logger.log("Initialization complete. Created/Updated sheets: Submissions, Projects, Skills, Experience");
}

// ==========================================
// 2. SECURE ENDPOINT & DYNAMIC GET API
// ==========================================
function doGet(e) {
  if (e.parameter.action === 'getPortfolioData' || e.parameter.action === 'getProjects') {
    return handleGetPortfolioData();
  }
  return ContentService.createTextOutput("403 Forbidden: Endpoint active.").setMimeType(ContentService.MimeType.TEXT);
}

function handleGetPortfolioData() {
  try {
    const doc = SpreadsheetApp.openById(SHEET_ID);
    
    function getSheetData(sheetName) {
      const sheet = doc.getSheetByName(sheetName);
      if (!sheet) return [];
      const data = sheet.getDataRange().getValues();
      if (data.length < 2) return [];
      const headers = data[0];
      let result = [];
      for(let i=1; i<data.length; i++) {
         let obj = {};
         for(let j=0; j<headers.length; j++) {
             obj[headers[j]] = data[i][j];
         }
         result.push(obj);
      }
      return result;
    }

    const payload = {
      projects: getSheetData('Projects'),
      skills: getSheetData('Skills'),
      experience: getSheetData('Experience')
    };

    return ContentService.createTextOutput(JSON.stringify({ result: 'success', data: payload }))
        .setMimeType(ContentService.MimeType.JSON);
        
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: err.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// 3. HANDLE FORM SUBMISSION & SEND EMAIL (POST)
// ==========================================
const OWNER_EMAIL = 'sbnpoudl@gmail.com'; // Your Email

function doPost(e) {
  try {
    const doc = SpreadsheetApp.openById(SHEET_ID);
    const sheet = doc.getSheetByName(SHEET_NAME) || doc.getSheets()[0];
    
    const name = e.parameter.name || 'Anonymous';
    const email = e.parameter.email || '';
    const idea = e.parameter.idea || 'No idea provided';
    const timestamp = new Date();

    // EMAIL VALIDATION
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format provided.");
    }
    
    // Append the row to the sheet
    sheet.appendRow([timestamp, name, email, idea]);
    
    // --- SEND AUTO-RESPONDER EMAIL (To Client) ---
    const subjectToClient = "Thanks for reaching out! - Sabin Poudel";
    const bodyToClient = `Hi ${name},\n\nI just received your inquiry regarding your project idea: \n\n"${idea}"\n\nI am currently reviewing this and will get back to you shortly to discuss how we can engineer a flawless solution.\n\nBest regards,\nSabin Poudel\nFull Stack Developer & IT Student`;
    
    MailApp.sendEmail({
      to: email,
      subject: subjectToClient,
      body: bodyToClient,
      name: "Sabin Poudel (Automated)"
    });

    // --- SEND NOTIFICATION EMAIL (To You) ---
    const subjectToOwner = `New Portfolio Lead: ${name}`;
    const bodyToOwner = `You have a new submission from your portfolio website!\n\nName: ${name}\nEmail: ${email}\nIdea: ${idea}\nTime: ${timestamp}\n\nCheck your Google Sheet for records.`;
    
    MailApp.sendEmail({
      to: OWNER_EMAIL,
      subject: subjectToOwner,
      body: bodyToOwner,
      replyTo: email
    });
    
    // Return a JSON success response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    // Return a JSON error response
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'message': error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
