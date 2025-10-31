// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    btn.classList.add('active');
    document.getElementById(tabId).classList.add('active');
  });
});

// File upload handling
const uploadSection = document.getElementById('uploadSection');
const fileInput = document.getElementById('fileInput');
const statusMessage = document.getElementById('statusMessage');

uploadSection.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  showStatus('Processing file...', 'info');
  
  try {
    if (file.name.endsWith('.json')) {
      const text = await file.text();
      const data = JSON.parse(text);
      await saveUserData(data);
      showStatus('✅ Data uploaded successfully!', 'success');
      updateUIState(true);
    } else if (file.name.endsWith('.pdf')) {
      showStatus('PDF parsing coming soon! Please use JSON for now.', 'error');
    }
  } catch (err) {
    showStatus('❌ Error processing file: ' + err.message, 'error');
  }
});

// Manual entry button
document.getElementById('manualEntryBtn').addEventListener('click', () => {
  // Open a new page for manual data entry
  chrome.tabs.create({ url: 'manual-entry.html' });
});

// Clear data
document.getElementById('clearDataBtn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to clear all stored data?')) {
    await chrome.storage.local.clear();
    showStatus('All data cleared!', 'info');
    updateUIState(false);
    updateStats();
  }
});

// Start autofill
document.getElementById('startFillBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const siteType = document.getElementById('siteSelect').value;
  const autoSubmit = document.getElementById('autoSubmitToggle').checked;
  const confirmSubmit = document.getElementById('confirmSubmitToggle').checked;
  
  chrome.tabs.sendMessage(tab.id, {
    action: 'startAutofill',
    siteType,
    autoSubmit,
    confirmSubmit
  });
  
  showStatus('Autofill started! Check the page.', 'success');
  document.getElementById('startFillBtn').style.display = 'none';
  document.getElementById('stopFillBtn').style.display = 'block';
});

// Stop autofill
document.getElementById('stopFillBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'stopAutofill' });
  
  showStatus('Autofill stopped.', 'info');
  document.getElementById('startFillBtn').style.display = 'block';
  document.getElementById('stopFillBtn').style.display = 'none';
});

// Export stats
document.getElementById('exportStatsBtn').addEventListener('click', async () => {
  const stats = await chrome.storage.local.get('applicationStats');
  const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'job-application-stats.json';
  a.click();
});

// Helper functions
function showStatus(message, type) {
  statusMessage.innerHTML = `<div class="status ${type}">${message}</div>`;
  setTimeout(() => {
    statusMessage.innerHTML = '';
  }, 5000);
}

async function saveUserData(data) {
  await chrome.storage.local.set({ userData: data });
}

async function updateUIState(hasData) {
  const clearBtn = document.getElementById('clearDataBtn');
  const uploadSection = document.getElementById('uploadSection');
  
  if (hasData) {
    clearBtn.style.display = 'block';
    uploadSection.classList.add('has-data');
    uploadSection.querySelector('p').innerHTML = '<strong>✓ Data Loaded</strong>';
  } else {
    clearBtn.style.display = 'none';
    uploadSection.classList.remove('has-data');
  }
}

async function updateStats() {
  const stats = await chrome.storage.local.get('applicationStats');
  const data = stats.applicationStats || { total: 0, today: 0, recent: [] };
  
  document.getElementById('totalApps').textContent = data.total || 0;
  document.getElementById('todayApps').textContent = data.today || 0;
  
  const recentDiv = document.getElementById('recentActivity');
  if (data.recent && data.recent.length > 0) {
    recentDiv.innerHTML = data.recent.slice(0, 5).map(app => 
      `<div style="margin-bottom: 8px;">
        <strong>${app.company}</strong> - ${app.position}<br>
        <span style="font-size: 11px; color: #999;">${new Date(app.date).toLocaleDateString()}</span>
      </div>`
    ).join('');
  } else {
    recentDiv.textContent = 'No applications yet';
  }
}

// Initialize on load
(async () => {
  const data = await chrome.storage.local.get('userData');
  updateUIState(!!data.userData);
  updateStats();
  
  // Load settings
  const settings = await chrome.storage.local.get(['autoSubmit', 'confirmSubmit']);
  if (settings.autoSubmit !== undefined) {
    document.getElementById('autoSubmitToggle').checked = settings.autoSubmit;
  }
  if (settings.confirmSubmit !== undefined) {
    document.getElementById('confirmSubmitToggle').checked = settings.confirmSubmit;
  }
})();

// Save settings when changed
document.getElementById('autoSubmitToggle').addEventListener('change', (e) => {
  chrome.storage.local.set({ autoSubmit: e.target.checked });
});

document.getElementById('confirmSubmitToggle').addEventListener('change', (e) => {
  chrome.storage.local.set({ confirmSubmit: e.target.checked });
});