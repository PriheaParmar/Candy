// Site configurations
const SITE_CONFIGS = {
  greenhouse: {
    patterns: ['greenhouse.io'],
    selectors: {
      firstName: ['input[name*="first_name" i]', 'input[id*="first_name" i]', 'input[autocomplete="given-name"]'],
      lastName: ['input[name*="last_name" i]', 'input[id*="last_name" i]', 'input[autocomplete="family-name"]'],
      email: ['input[type="email"]', 'input[name*="email" i]', 'input[autocomplete="email"]'],
      phone: ['input[type="tel"]', 'input[name*="phone" i]', 'input[autocomplete="tel"]'],
      resume: ['input[type="file"]']
    }
  }
};

let isAutofilling = false;
let userData = null;
let currentSiteType = 'auto';
let settings = { autoSubmit: false, confirmSubmit: true };

// Detect site type
function detectSiteType() {
  const url = window.location.href.toLowerCase();
  
  for (const [type, config] of Object.entries(SITE_CONFIGS)) {
    if (config.patterns.some(pattern => url.includes(pattern))) {
      return type;
    }
  }
  
  return 'generic';
}

// Enhanced field finder - checks multiple methods
function findInputField(labelTexts, types = ['text', 'email', 'tel', 'url']) {
  // Method 1: Try by label text
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    const labelText = label.textContent.toLowerCase().trim();
    
    for (const searchText of labelTexts) {
      if (labelText.includes(searchText.toLowerCase())) {
        // Found matching label, now find associated input
        const forId = label.getAttribute('for');
        if (forId) {
          const input = document.getElementById(forId);
          if (input) return input;
        }
        
        // Check if input is inside label
        const inputInLabel = label.querySelector('input, textarea');
        if (inputInLabel) return inputInLabel;
        
        // Check next siblings
        let sibling = label.nextElementSibling;
        while (sibling && sibling.tagName !== 'LABEL') {
          if (sibling.tagName === 'INPUT' || sibling.tagName === 'TEXTAREA') {
            return sibling;
          }
          const inputInSibling = sibling.querySelector('input, textarea');
          if (inputInSibling) return inputInSibling;
          sibling = sibling.nextElementSibling;
        }
        
        // Check parent's next sibling
        const parentNext = label.parentElement?.nextElementSibling;
        if (parentNext) {
          const inputInParentNext = parentNext.querySelector('input, textarea');
          if (inputInParentNext) return inputInParentNext;
        }
      }
    }
  }
  
  // Method 2: Try by placeholder
  const inputs = document.querySelectorAll('input, textarea');
  for (const input of inputs) {
    const placeholder = (input.placeholder || '').toLowerCase();
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    
    for (const searchText of labelTexts) {
      const search = searchText.toLowerCase();
      if (placeholder.includes(search) || name.includes(search) || 
          id.includes(search) || ariaLabel.includes(search)) {
        if (types.includes(input.type) || input.tagName === 'TEXTAREA') {
          return input;
        }
      }
    }
  }
  
  return null;
}

// Find select/dropdown field
function findSelectField(labelTexts) {
  // Try by label
  const labels = document.querySelectorAll('label');
  for (const label of labels) {
    const labelText = label.textContent.toLowerCase().trim();
    
    for (const searchText of labelTexts) {
      if (labelText.includes(searchText.toLowerCase())) {
        const forId = label.getAttribute('for');
        if (forId) {
          const select = document.getElementById(forId);
          if (select && select.tagName === 'SELECT') return select;
        }
        
        const selectInLabel = label.querySelector('select');
        if (selectInLabel) return selectInLabel;
        
        let sibling = label.nextElementSibling;
        while (sibling && sibling.tagName !== 'LABEL') {
          if (sibling.tagName === 'SELECT') return sibling;
          const selectInSibling = sibling.querySelector('select');
          if (selectInSibling) return selectInSibling;
          sibling = sibling.nextElementSibling;
        }
      }
    }
  }
  
  // Try by name/id
  const selects = document.querySelectorAll('select');
  for (const select of selects) {
    const name = (select.name || '').toLowerCase();
    const id = (select.id || '').toLowerCase();
    
    for (const searchText of labelTexts) {
      if (name.includes(searchText.toLowerCase()) || id.includes(searchText.toLowerCase())) {
        return select;
      }
    }
  }
  
  return null;
}

// Find radio buttons
function findRadioButtons(labelTexts) {
  const allRadios = document.querySelectorAll('input[type="radio"]');
  const radioGroups = new Map();
  
  // Group radios by name
  allRadios.forEach(radio => {
    if (!radioGroups.has(radio.name)) {
      radioGroups.set(radio.name, []);
    }
    radioGroups.get(radio.name).push(radio);
  });
  
  // Find matching group by looking at nearby labels
  for (const [groupName, radios] of radioGroups) {
    const firstRadio = radios[0];
    let container = firstRadio.closest('fieldset') || firstRadio.closest('div[role="radiogroup"]') || firstRadio.parentElement;
    
    // Look for legend or heading
    const legend = container?.querySelector('legend');
    const heading = container?.querySelector('h1, h2, h3, h4, h5, h6, label');
    const containerText = legend?.textContent || heading?.textContent || '';
    
    for (const searchText of labelTexts) {
      if (containerText.toLowerCase().includes(searchText.toLowerCase())) {
        return { name: groupName, radios, container };
      }
    }
  }
  
  return null;
}

// Fill text input with proper event triggering
function fillTextInput(field, value) {
  if (!field || !value) return false;
  
  try {
    // Focus the field
    field.focus();
    
    // Clear existing value
    field.value = '';
    
    // Set new value
    field.value = value;
    
    // Trigger all necessary events
    field.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    field.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
    
    // React-specific events
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeInputValueSetter.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log(`✓ Filled: ${field.name || field.id} = ${value}`);
    return true;
  } catch (err) {
    console.error('Error filling field:', err);
    return false;
  }
}

// Fill select/dropdown
function fillSelect(field, value) {
  if (!field || !value) return false;
  
  try {
    const options = Array.from(field.options);
    const valueStr = value.toString().toLowerCase().trim();
    
    // Try exact value match
    let matchedOption = options.find(opt => opt.value.toLowerCase() === valueStr);
    
    // Try exact text match
    if (!matchedOption) {
      matchedOption = options.find(opt => opt.text.toLowerCase().trim() === valueStr);
    }
    
    // Try partial text match
    if (!matchedOption) {
      matchedOption = options.find(opt => 
        opt.text.toLowerCase().includes(valueStr) || 
        valueStr.includes(opt.text.toLowerCase().trim())
      );
    }
    
    // Try partial value match
    if (!matchedOption) {
      matchedOption = options.find(opt => 
        opt.value.toLowerCase().includes(valueStr) || 
        valueStr.includes(opt.value.toLowerCase())
      );
    }
    
    if (matchedOption) {
      field.value = matchedOption.value;
      field.dispatchEvent(new Event('change', { bubbles: true }));
      field.dispatchEvent(new Event('blur', { bubbles: true }));
      console.log(`✓ Selected: ${field.name || field.id} = ${matchedOption.text}`);
      return true;
    }
    
    console.log(`✗ No match found in dropdown for: ${value}`);
    return false;
  } catch (err) {
    console.error('Error filling select:', err);
    return false;
  }
}

// Fill radio button
function fillRadioButton(radioGroup, value) {
  if (!radioGroup || !value) return false;
  
  try {
    const valueStr = value.toString().toLowerCase().trim();
    const { radios } = radioGroup;
    
    for (const radio of radios) {
      // Get label text for this radio
      let labelText = '';
      const label = document.querySelector(`label[for="${radio.id}"]`);
      if (label) {
        labelText = label.textContent.toLowerCase().trim();
      } else if (radio.parentElement?.tagName === 'LABEL') {
        labelText = radio.parentElement.textContent.toLowerCase().trim();
      }
      
      const radioValue = radio.value.toLowerCase().trim();
      
      // Check for match
      if (radioValue === valueStr || labelText.includes(valueStr) || valueStr.includes(labelText)) {
        radio.checked = true;
        radio.dispatchEvent(new Event('change', { bubbles: true }));
        radio.dispatchEvent(new Event('click', { bubbles: true }));
        console.log(`✓ Selected radio: ${labelText || radioValue}`);
        return true;
      }
    }
    
    // Try "yes" variations
    if (['yes', 'y', 'true', '1'].includes(valueStr)) {
      const yesRadio = radios.find(r => {
        const label = document.querySelector(`label[for="${r.id}"]`);
        const text = (label?.textContent || r.value).toLowerCase();
        return text.includes('yes') || r.value === 'true' || r.value === '1';
      });
      
      if (yesRadio) {
        yesRadio.checked = true;
        yesRadio.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✓ Selected radio: Yes`);
        return true;
      }
    }
    
    // Try "no" variations
    if (['no', 'n', 'false', '0'].includes(valueStr)) {
      const noRadio = radios.find(r => {
        const label = document.querySelector(`label[for="${r.id}"]`);
        const text = (label?.textContent || r.value).toLowerCase();
        return text.includes('no') || r.value === 'false' || r.value === '0';
      });
      
      if (noRadio) {
        noRadio.checked = true;
        noRadio.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`✓ Selected radio: No`);
        return true;
      }
    }
    
    console.log(`✗ No matching radio button for: ${value}`);
    return false;
  } catch (err) {
    console.error('Error filling radio:', err);
    return false;
  }
}

// Handle file upload indicator
function handleFileUpload(field, fileName) {
  console.log(`⚠️ File upload field found: ${fileName}`);
  
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #ff9800;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  indicator.textContent = `⚠️ Please upload: ${fileName}`;
  document.body.appendChild(indicator);
  
  // Highlight the upload field
  field.style.outline = '3px solid #ff9800';
  field.style.outlineOffset = '2px';
  
  setTimeout(() => {
    indicator.remove();
    field.style.outline = '';
  }, 10000);
}

// Main autofill function for Greenhouse
async function autofillGreenhouse() {
  if (!userData) {
    showNotification('❌ No user data found!', 'error');
    return;
  }
  
  console.log('Starting Greenhouse autofill with data:', userData);
  let filledCount = 0;
  
  // Define field mappings with search terms
  const fieldMappings = [
    { key: 'first_name', labels: ['first name', 'given name', 'firstname'], type: 'text' },
    { key: 'last_name', labels: ['last name', 'surname', 'family name', 'lastname'], type: 'text' },
    { key: 'email', labels: ['email', 'e-mail'], type: 'email' },
    { key: 'phone', labels: ['phone', 'mobile', 'telephone', 'contact number'], type: 'tel' },
    { key: 'location', labels: ['location', 'city', 'current location'], type: 'text' },
    { key: 'linkedin', labels: ['linkedin', 'linkedin profile', 'linkedin url'], type: 'url' },
    { key: 'address_line_1', labels: ['address line 1', 'street address', 'address'], type: 'text' },
    { key: 'address_line_2', labels: ['address line 2', 'apt', 'suite', 'unit'], type: 'text' },
    { key: 'city', labels: ['city'], type: 'text' },
    { key: 'zip_code', labels: ['zip', 'postal code', 'postcode', 'zip code'], type: 'text' },
    { key: 'legal_first_name', labels: ['legal first name'], type: 'text' },
    { key: 'legal_last_name', labels: ['legal last name'], type: 'text' },
    { key: 'school', labels: ['school', 'university', 'college', 'institution'], type: 'text' },
    { key: 'degree', labels: ['degree'], type: 'text' },
    { key: 'discipline', labels: ['discipline', 'major', 'field of study'], type: 'text' },
    
    // Select fields
    { key: 'country', labels: ['country'], type: 'select' },
    { key: 'state', labels: ['state', 'province', 'region'], type: 'select' },
    { key: 'education_level', labels: ['education', 'highest level of education', 'education completed'], type: 'select' },
    { key: 'gender', labels: ['gender'], type: 'select' },
    { key: 'race', labels: ['race', 'ethnicity'], type: 'select' },
    { key: 'veteran_status', labels: ['veteran', 'veteran status'], type: 'select' },
    
    // Radio/Yes-No fields
    { key: 'work_authorization', labels: ['authorized to work', 'work authorization', 'authorized to work in'], type: 'radio' },
    { key: 'visa_sponsorship', labels: ['visa sponsorship', 'require visa sponsorship', 'sponsorship'], type: 'radio' },
    { key: 'age_18', labels: ['18 years', 'at least 18', 'age'], type: 'radio' },
    { key: 'hispanic_latino', labels: ['hispanic', 'latino'], type: 'radio' },
    { key: 'disability_status', labels: ['disability'], type: 'radio' },
    
    // Text areas (longer answers)
    { key: 'years_experience', labels: ['years of experience', 'experience do you have'], type: 'text' },
    { key: 'devops_experience', labels: ['devops', 'years of experience do you have in devops'], type: 'text' },
    { key: 'aws_experience', labels: ['aws', 'amazon web services'], type: 'text' },
    { key: 'programming_languages', labels: ['programming languages', 'technologies', 'technical skills'], type: 'text' },
    { key: 'why_interested', labels: ['why', 'interested', 'why do you want'], type: 'textarea' },
    { key: 'how_hear', labels: ['how did you hear', 'hear about'], type: 'select' }
  ];
  
  // Process each field mapping
  for (const mapping of fieldMappings) {
    const value = userData[mapping.key];
    if (!value) continue;
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
    
    try {
      if (mapping.type === 'select') {
        const field = findSelectField(mapping.labels);
        if (field && fillSelect(field, value)) {
          filledCount++;
        }
      } else if (mapping.type === 'radio') {
        const radioGroup = findRadioButtons(mapping.labels);
        if (radioGroup && fillRadioButton(radioGroup, value)) {
          filledCount++;
        }
      } else {
        const types = mapping.type === 'textarea' ? ['text'] : [mapping.type, 'text'];
        const field = findInputField(mapping.labels, types);
        if (field && fillTextInput(field, value)) {
          filledCount++;
        }
      }
    } catch (err) {
      console.error(`Error filling ${mapping.key}:`, err);
    }
  }
  
  // Handle resume upload
  const resumeField = document.querySelector('input[type="file"]');
  if (resumeField && userData.resume) {
    handleFileUpload(resumeField, 'Resume/CV');
  }
  
  console.log(`Autofill complete. Filled ${filledCount} fields.`);
  showNotification(`✓ Filled ${filledCount} fields`, filledCount > 0 ? 'success' : 'error');
  
  // Look for next button
  await new Promise(resolve => setTimeout(resolve, 1000));
  const nextButton = findNextButton();
  
  if (nextButton) {
    showNotification('✓ Found Next button. Click to continue.', 'info');
    highlightElement(nextButton);
    
    if (settings.autoSubmit) {
      if (settings.confirmSubmit) {
        if (confirm('Ready to click Next/Continue?')) {
          await new Promise(resolve => setTimeout(resolve, 500));
          nextButton.click();
        }
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000));
        nextButton.click();
      }
    }
  }
}

// Find next/continue/submit button
function findNextButton() {
  const buttonTexts = ['submit application', 'submit', 'next', 'continue', 'save and continue'];
  const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], a[role="button"]'));
  
  for (const btn of buttons) {
    const text = btn.textContent.toLowerCase().trim();
    const value = (btn.value || '').toLowerCase();
    const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
    
    for (const btnText of buttonTexts) {
      if (text.includes(btnText) || value.includes(btnText) || ariaLabel.includes(btnText)) {
        // Make sure it's visible
        const rect = btn.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          return btn;
        }
      }
    }
  }
  
  return null;
}

// Highlight element
function highlightElement(element) {
  const original = element.style.cssText;
  element.style.outline = '3px solid #4CAF50';
  element.style.outlineOffset = '2px';
  element.style.boxShadow = '0 0 10px rgba(76, 175, 80, 0.5)';
  
  setTimeout(() => {
    element.style.cssText = original;
  }, 5000);
}

// Show notification
function showNotification(message, type = 'info') {
  const existingNotif = document.getElementById('autofill-notification');
  if (existingNotif) existingNotif.remove();
  
  const colors = {
    success: '#4CAF50',
    error: '#f44336',
    info: '#2196F3',
    warning: '#ff9800'
  };
  
  const notif = document.createElement('div');
  notif.id = 'autofill-notification';
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 300px;
  `;
  
  notif.textContent = message;
  document.body.appendChild(notif);
  
  setTimeout(() => notif.remove(), 5000);
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startAutofill') {
    isAutofilling = true;
    currentSiteType = request.siteType;
    settings.autoSubmit = request.autoSubmit;
    settings.confirmSubmit = request.confirmSubmit;
    
    chrome.storage.local.get('userData', (result) => {
      userData = result.userData;
      
      if (!userData) {
        showNotification('⚠️ No data found. Please upload data first.', 'error');
        return;
      }
      
      console.log('User data loaded:', userData);
      showNotification('🚀 Starting autofill...', 'info');
      
      setTimeout(() => {
        const siteType = currentSiteType === 'auto' ? detectSiteType() : currentSiteType;
        console.log('Detected site type:', siteType);
        
        if (siteType === 'greenhouse') {
          autofillGreenhouse();
        } else {
          showNotification(`Site type: ${siteType} - Using generic autofill`, 'info');
          autofillGreenhouse(); // Use same logic for now
        }
      }, 500);
    });
    
    sendResponse({ success: true });
  } else if (request.action === 'stopAutofill') {
    isAutofilling = false;
    showNotification('⏸️ Autofill stopped', 'info');
    sendResponse({ success: true });
  }
  
  return true;
});

// Log when extension loads
console.log('Job Autofill Extension: Content script loaded');
console.log('Current URL:', window.location.href);
console.log('Detected site:', detectSiteType());