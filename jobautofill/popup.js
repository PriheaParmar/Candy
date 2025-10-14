// popup.js
const profileFile = document.getElementById('profileFile');
const profileSelect = document.getElementById('profileSelect');
const scanBtn = document.getElementById('scanBtn');
const autofillBtn = document.getElementById('autofillBtn');
const log = document.getElementById('log');

function logMsg(s){ log.innerText = (new Date()).toLocaleTimeString() + ' — ' + s + '\n' + log.innerText; }

profileFile.addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  try {
    const txt = await f.text();
    const obj = JSON.parse(txt);
    // save to storage and populate select
    chrome.storage.local.get({profiles: []}, (res) => {
      const profiles = res.profiles || [];
      profiles.unshift({name: obj.profileName || 'profile', data: obj});
      chrome.storage.local.set({profiles}, () => {
        populateProfiles();
        logMsg('Profile loaded: ' + (obj.profileName || 'profile'));
      });
    });
  } catch(err){
    logMsg('Error parsing JSON: ' + err.message);
  }
});

function populateProfiles(){
  chrome.storage.local.get({profiles: []}, (res) => {
    const profiles = res.profiles || [];
    profileSelect.innerHTML = '';
    profiles.forEach((p, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      opt.text = p.name || ('Profile ' + idx);
      profileSelect.add(opt);
    });
  });
}
populateProfiles();

async function sendToActiveTab(action){
  const [tab] = await chrome.tabs.query({active:true,currentWindow:true});
  if (!tab) { logMsg('No active tab'); return; }
  chrome.storage.local.get({profiles: []}, (res) => {
    const profiles = res.profiles || [];
    const sel = profileSelect.value;
    const profile = profiles[sel]?.data;
    if (!profile) return logMsg('Select profile first');
    chrome.tabs.sendMessage(tab.id, {action, profile}, (resp) => {
      if (chrome.runtime.lastError) {
        logMsg('Content script not ready: ' + chrome.runtime.lastError.message);
      } else {
        logMsg('Response: ' + (resp && resp.status ? resp.status : JSON.stringify(resp)));
      }
    });
  });
}

scanBtn.addEventListener('click', () => sendToActiveTab('scan'));
autofillBtn.addEventListener('click', () => sendToActiveTab('autofill'));

function downloadResume(profile){
  try {
    const base64 = profile.resumeData && profile.resumeData.resumeBase64;
    if(!base64) return logMsg('No resume base64 found');
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i=0;i<len;i++) bytes[i]=binary.charCodeAt(i);
    const blob = new Blob([bytes], {type:'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = profile.resumeData.fileName || 'resume.pdf';
    a.click();
    URL.revokeObjectURL(url);
    logMsg('Resume downloaded. Attach it to site file input.');
  } catch(e){ logMsg('Resume download failed: ' + e.message); }
}
