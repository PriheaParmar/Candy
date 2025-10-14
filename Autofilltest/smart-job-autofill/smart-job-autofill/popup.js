const fileInput = document.getElementById('fileInput');
const status = document.getElementById('status');
const candidateCard = document.getElementById('candidateCard');
const candidateDetails = document.getElementById('candidateDetails');
const fillBtn = document.getElementById('fillBtn');

// Load saved data on popup open
chrome.storage.local.get(['candidateData'], (result) => {
  if (result.candidateData) {
    displayCandidate(result.candidateData);
    fillBtn.disabled = false;
  }
});

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const data = JSON.parse(text);
    
    // Save to Chrome storage
    chrome.storage.local.set({ candidateData: data }, () => {
      showStatus('✓ Data loaded successfully!', 'success');
      displayCandidate(data);
      fillBtn.disabled = false;
    });
  } catch (err) {
    showStatus('✗ Invalid JSON file', 'error');
  }
});

fillBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  fillBtn.textContent = '⏳ Filling...';
  fillBtn.disabled = true;
  
  chrome.tabs.sendMessage(tab.id, { action: 'fillForm' }, (response) => {
    if (response && response.success) {
      showStatus(`✓ Filled ${response.fieldsFound} fields!`, 'success');
    } else {
      showStatus('✗ No form fields found', 'error');
    }
    fillBtn.textContent = '⚡ Auto-Fill This Page';
    fillBtn.disabled = false;
  });
});

function displayCandidate(data) {
  const fields = [
    { label: 'Name', value: `${data.firstName || ''} ${data.lastName || ''}`.trim() },
    { label: 'Email', value: data.email },
    { label: 'Phone', value: data.phone },
    { label: 'Location', value: data.city || data.location }
  ].filter(f => f.value);

  candidateDetails.innerHTML = fields.map(f => 
    `<div><strong>${f.label}:</strong> ${f.value}</div>`
  ).join('');
  
  candidateCard.style.display = 'block';
}

function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
  setTimeout(() => status.className = 'status hidden', 3000);
}