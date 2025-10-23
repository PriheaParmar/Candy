// popup.js
const fileInput = document.getElementById('file');
const jsonText = document.getElementById('jsonText');
const saveBtn = document.getElementById('save');
const fillBtn = document.getElementById('fill');
const status = document.getElementById('status');
const autoSubmitCheckbox = document.getElementById('autoSubmit');
const loadExampleBtn = document.getElementById('loadExample');
const clearBtn = document.getElementById('clear');

const exampleJson = `{
  "firstName":"Richitha",
  "lastName":"Dayara",
  "fullName":"Richitha Dayara",
  "email":"richitha@workwebmail.com",
  "phone":"+1(940)-843-5456",
  "address":"2417 Charlotte St, Denton, TX, 76201",
  "city":"Denton",
  "state":"Texas",
  "zip":"76201",
  "country":"United States",
  "linkedin":"http://www.linkedin.com/in/richitha-dayara-796442321",
  "website":"https://www.datascienceportfol.io/RichithaDataAnalyst",
  "degree":"Bachelor of Engineering",
  "university":"Sreenidhi Institute of Science & Technology",
  "graduationYear":"2020",
  "company":"Tech Corp Inc.",
  "jobTitle":"Senior Software Engineer",
  "experience":"5 years",
  "skills":"Python, SQL, Tableau, AWS",
  "summary":"Results-driven Data Analyst with 3+ years...",
  "coverLetter":"I am excited to apply for this position...",
  "salary":"75000",
  "startDate":"2025-11-01",
  "citizenship":"Non US",
  "workAuth": true,
  "veteran": false,
  "disability": false,
  "gender": "Female",
  "race": "Asian",
  "referral": "LinkedIn"
}`;

loadExampleBtn.addEventListener('click', () => {
  jsonText.value = exampleJson;
});

clearBtn.addEventListener('click', () => {
  jsonText.value = '';
});

fileInput.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    jsonText.value = reader.result;
  };
  reader.readAsText(f);
});

saveBtn.addEventListener('click', async () => {
  try {
    const obj = JSON.parse(jsonText.value);
    await chrome.storage.local.set({ profileJson: obj });
    status.textContent = 'Saved JSON to local storage ✅';
    setTimeout(()=>status.textContent='','2500');
  } catch (err) {
    status.style.color = 'red';
    status.textContent = 'Invalid JSON — fix and try again';
    setTimeout(()=>{status.textContent=''; status.style.color='green'}, 3000);
  }
});

fillBtn.addEventListener('click', async () => {
  const data = await chrome.storage.local.get(['profileJson']);
  const profile = data.profileJson;
  if (!profile) {
    status.style.color='red';
    status.textContent = 'No JSON saved. Paste or upload and Save first.';
    setTimeout(()=>{status.textContent=''; status.style.color='green'},3000);
    return;
  }

  const options = { autoSubmit: autoSubmitCheckbox.checked };
  // send message to active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) {
    status.style.color='red';
    status.textContent = 'No active tab';
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (profile, options) => {
      // content script exposes window.__JOB_AUTOFILL_FILL if loaded
      if (window.__JOB_AUTOFILL_FILL) {
        window.__JOB_AUTOFILL_FILL(profile, options);
        return { result: 'injected' };
      } else {
        // fallback: dispatch custom event with the data
        window.dispatchEvent(new CustomEvent('jobAutofill_fill', { detail: { profile, options } }));
        return { result: 'dispatched' };
      }
    },
    args: [profile, options]
  }).then(() => {
    status.textContent = 'Fill command sent — check page fields ✅';
    setTimeout(()=>status.textContent='', 3000);
  }).catch(err => {
    status.style.color='red';
    status.textContent = 'Error sending fill command';
    console.error(err);
    setTimeout(()=>{status.textContent=''; status.style.color='green'},3000);
  });
});
