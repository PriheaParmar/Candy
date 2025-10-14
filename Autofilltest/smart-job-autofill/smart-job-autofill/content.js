// Intelligent field mapping with US-specific patterns
const FIELD_PATTERNS = {
  firstName: ['first.*name', 'fname', 'firstname', 'given.*name', 'forename'],
  lastName: ['last.*name', 'lname', 'lastname', 'surname', 'family.*name'],
  fullName: ['full.*name', '^name$', 'your.*name', 'applicant.*name', 'candidate.*name'],
  email: ['email', 'e-mail', 'mail'],
  phone: ['phone', 'mobile', 'telephone', 'cell', 'contact.*number'],
  address: ['address', 'street', 'addr'],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'province', 'region'],
  zip: ['zip', 'postal', 'postcode', 'zipcode'],
  country: ['country', 'nation'],
  linkedin: ['linkedin', 'linked-in', 'li.*url', 'li.*profile'],
  website: ['website', 'portfolio', 'url', 'homepage', 'personal.*site'],
  github: ['github', 'git.*profile'],
  degree: ['degree', 'education.*level', 'qualification'],
  university: ['university', 'college', 'school', 'institution'],
  major: ['major', 'field.*study', 'specialization', 'degree.*program'],
  company: ['company', 'employer', 'organization', 'current.*company'],
  jobTitle: ['job.*title', 'position', 'role', 'current.*title', 'designation'],
  experience: ['experience', 'years.*exp', 'work.*exp', 'total.*exp'],
  skills: ['skills', 'expertise', 'technologies', 'competencies'],
  summary: ['summary', 'about', 'bio', 'profile', 'objective', 'description'],
  coverLetter: ['cover.*letter', 'motivation', 'why.*apply'],
  salary: ['salary', 'compensation', 'expected.*salary', 'pay'],
  startDate: ['start.*date', 'available.*from', 'join.*date'],
  citizenship: ['citizenship', 'nationality', 'citizen.*status'],
  workAuth: ['work.*auth', 'visa.*status', 'eligible.*work', 'right.*work', 'authorized.*work'],
  veteran: ['veteran', 'military.*service'],
  disability: ['disability', 'disabled', 'accommodation'],
  gender: ['gender', 'sex'],
  race: ['race', 'ethnicity', 'ethnic'],
  referral: ['referral', 'referred.*by', 'how.*hear', 'source']
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fillForm') {
    chrome.storage.local.get(['candidateData'], (result) => {
      if (result.candidateData) {
        const fieldsFound = fillFormFields(result.candidateData);
        sendResponse({ success: true, fieldsFound });
      } else {
        sendResponse({ success: false });
      }
    });
    return true; // Keep message channel open
  }
});

function fillFormFields(data) {
  const inputs = document.querySelectorAll('input, textarea, select');
  let count = 0;

  inputs.forEach(input => {
    if (input.type === 'hidden' || input.disabled || input.readOnly) return;
    
    const fieldType = identifyField(input);
    if (fieldType && data[fieldType]) {
      fillField(input, data[fieldType], fieldType);
      count++;
    }
  });

  return count;
}

function identifyField(input) {
  const attrs = [
    input.name,
    input.id,
    input.placeholder,
    input.getAttribute('aria-label'),
    input.getAttribute('data-field'),
    input.getAttribute('formcontrolname'),
    input.className
  ].filter(Boolean).join(' ').toLowerCase();

  const label = findLabel(input);
  const searchText = `${attrs} ${label}`.toLowerCase();

  // Check each pattern
  for (const [field, patterns] of Object.entries(FIELD_PATTERNS)) {
    for (const pattern of patterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(searchText)) {
        return field;
      }
    }
  }

  return null;
}

function findLabel(input) {
  // Check for explicit label
  if (input.id) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) return label.textContent;
  }

  // Check parent label
  const parentLabel = input.closest('label');
  if (parentLabel) return parentLabel.textContent;

  // Check previous sibling
  let prev = input.previousElementSibling;
  while (prev) {
    if (prev.tagName === 'LABEL' || prev.tagName === 'SPAN' || prev.tagName === 'DIV') {
      const text = prev.textContent.trim();
      if (text.length < 100) return text;
    }
    prev = prev.previousElementSibling;
  }

  return '';
}

function fillField(input, value, fieldType) {
  // Handle special cases
  if (fieldType === 'fullName' && !value) {
    value = `${input.dataset.firstName || ''} ${input.dataset.lastName || ''}`.trim();
  }

  if (fieldType === 'workAuth' && typeof value === 'boolean') {
    value = value ? 'Yes' : 'No';
  }

  if (input.tagName === 'SELECT') {
    fillSelect(input, value);
  } else if (input.type === 'checkbox') {
    input.checked = ['yes', 'true', '1', true].includes(String(value).toLowerCase());
  } else if (input.type === 'radio') {
    const normalizedValue = String(value).toLowerCase();
    if (input.value.toLowerCase() === normalizedValue) {
      input.checked = true;
    }
  } else {
    input.value = value;
    
    // Trigger events for React/Angular/Vue forms
    ['input', 'change', 'blur'].forEach(eventType => {
      input.dispatchEvent(new Event(eventType, { bubbles: true }));
    });
  }

  // Visual feedback
  input.style.backgroundColor = '#d4edda';
  setTimeout(() => input.style.backgroundColor = '', 1000);
}

function fillSelect(select, value) {
  const normalizedValue = String(value).toLowerCase();
  
  for (const option of select.options) {
    const optionText = option.textContent.toLowerCase();
    const optionValue = option.value.toLowerCase();
    
    if (optionValue === normalizedValue || 
        optionText === normalizedValue ||
        optionText.includes(normalizedValue) ||
        normalizedValue.includes(optionText)) {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }
  }
}