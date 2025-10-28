// ==============================================================================
// MULTI-PLATFORM JOB APPLICATION AUTOFILL SYSTEM
// ==============================================================================
// Supports: Workday, Greenhouse, Lever, Taleo, iCIMS, ADP, and more
// Auto-detects platform or allows manual selection
// ==============================================================================

(function() {
  const DEBUG = true;
  const log = (...args) => DEBUG && console.log('[JobAutofill]', ...args);

  // ================================
  // PLATFORM CONFIGURATIONS
  // ================================
  const PLATFORMS = {
    workforcenow: {
      name: 'ADP WorkforceNow',
      detect: () => window.location.hostname.includes('workforcenow') || 
                    window.location.hostname.includes('adp.com'),
      fields: {
        firstName: ['firstname', 'fname', 'first_name', 'applicant.name.givenname'],
        lastName: ['lastname', 'lname', 'last_name', 'applicant.name.familyname'],
        email: ['email', 'e-mail', 'emailaddress', 'applicant.email'],
        phone: ['phone', 'mobile', 'phonenumber', 'applicant.phonenumber', 'mobilenumber'],
        address: ['address', 'street', 'addressline1'],
        city: ['city', 'town'],
        state: ['state', 'province'],
        zip: ['zipcode', 'zip', 'postalcode']
      },
      submitButton: 'button[type="submit"], input[value*="Submit"], button:contains("Submit")'
    },

    greenhouse: {
      name: 'Greenhouse',
      detect: () => window.location.hostname.includes('greenhouse.io') || 
                    document.querySelector('[data-source="greenhouse"]') !== null,
      fields: {
        firstName: ['first_name', 'firstname', 'input[name*="first"]'],
        lastName: ['last_name', 'lastname', 'input[name*="last"]'],
        email: ['email', 'email_address'],
        phone: ['phone', 'phone_number'],
        resume: ['resume', 'cv', 'input[type="file"]'],
        coverLetter: ['cover_letter', 'coverletter'],
        linkedin: ['linkedin', 'linkedin_url'],
        website: ['website', 'portfolio'],
        location: ['location', 'current_location'],
        // Greenhouse specific questions
        authorizedToWork: ['legally_authorized', 'authorized_to_work', 'work_authorization'],
        requireSponsorship: ['require_sponsorship', 'visa_sponsorship', 'need_sponsorship'],
        willingToRelocate: ['willing_to_relocate', 'relocate']
      },
      customQuestions: {
        'are you located in': 'location',
        'require sponsorship': 'requireSponsorship',
        'authorized to work': 'authorizedToWork',
        'willing to relocate': 'willingToRelocate'
      },
      submitButton: 'button[type="submit"], input#submit_app'
    },

    workday: {
      name: 'Workday',
      detect: () => window.location.hostname.includes('myworkdayjobs.com') || 
                    document.querySelector('[data-automation-id]') !== null,
      fields: {
        firstName: ['input[data-automation-id*="legalNameSection_firstName"]', 'input[name*="firstName"]'],
        lastName: ['input[data-automation-id*="legalNameSection_lastName"]', 'input[name*="lastName"]'],
        email: ['input[data-automation-id*="email"]', 'input[type="email"]'],
        phone: ['input[data-automation-id*="phone"]', 'input[type="tel"]'],
        address: ['input[data-automation-id*="addressLine1"]'],
        city: ['input[data-automation-id*="city"]'],
        state: ['input[data-automation-id*="state"]'],
        zip: ['input[data-automation-id*="postalCode"]'],
        country: ['input[data-automation-id*="country"]']
      },
      submitButton: 'button[data-automation-id="bottom-navigation-next-button"]'
    },

    lever: {
      name: 'Lever',
      detect: () => window.location.hostname.includes('lever.co') || 
                    document.querySelector('.application-form') !== null,
      fields: {
        fullName: ['name', 'full_name'],
        email: ['email'],
        phone: ['phone'],
        resume: ['resume', 'input[type="file"]'],
        coverLetter: ['cover-letter', 'comments'],
        linkedin: ['urls[LinkedIn]', 'linkedin'],
        github: ['urls[Github]', 'github'],
        website: ['urls[Website]', 'website']
      },
      submitButton: 'button.template-btn-submit'
    },

    taleo: {
      name: 'Oracle Taleo',
      detect: () => window.location.hostname.includes('taleo.net'),
      fields: {
        firstName: ['input[id*="firstname"]', 'input[name*="firstname"]'],
        lastName: ['input[id*="lastname"]', 'input[name*="lastname"]'],
        email: ['input[id*="email"]', 'input[type="email"]'],
        phone: ['input[id*="phone"]', 'input[type="tel"]'],
        resume: ['input[type="file"][id*="resume"]']
      },
      submitButton: 'button[id*="submit"], input[value*="Submit"]'
    },

    icims: {
      name: 'iCIMS',
      detect: () => window.location.hostname.includes('icims.com') || 
                    document.querySelector('.iCIMS_JobsTable') !== null,
      fields: {
        firstName: ['input[id*="firstname"]', 'input[name*="firstname"]'],
        lastName: ['input[id*="lastname"]', 'input[name*="lastname"]'],
        email: ['input[type="email"]'],
        phone: ['input[type="tel"]'],
        address: ['input[id*="address"]'],
        city: ['input[id*="city"]'],
        state: ['select[id*="state"]'],
        zip: ['input[id*="zip"]']
      },
      submitButton: 'input[type="submit"]'
    },

    rippling: {
      name: 'Rippling',
      detect: () => window.location.hostname.includes('rippling.com'),
      fields: {
        firstName: ['input[name*="firstName"]', 'input[placeholder*="First"]'],
        lastName: ['input[name*="lastName"]', 'input[placeholder*="Last"]'],
        email: ['input[type="email"]'],
        phone: ['input[type="tel"]'],
        linkedin: ['input[placeholder*="LinkedIn"]'],
        resume: ['input[type="file"]']
      },
      submitButton: 'button[type="submit"]'
    },

    generic: {
      name: 'Generic Form',
      detect: () => true, // Always matches as fallback
      fields: {
        firstName: ['firstname', 'fname', 'first_name', 'first'],
        lastName: ['lastname', 'lname', 'last_name', 'last'],
        fullName: ['fullname', 'full_name', 'name'],
        email: ['email', 'e-mail', 'emailaddress'],
        phone: ['phone', 'mobile', 'telephone', 'cell'],
        address: ['address', 'street'],
        city: ['city'],
        state: ['state'],
        zip: ['zip', 'postal', 'zipcode'],
        country: ['country']
      },
      submitButton: 'button[type="submit"], input[type="submit"]'
    }
  };

  // ================================
  // PLATFORM DETECTION
  // ================================
  function detectPlatform() {
    log('🔍 Detecting platform...');
    
    for (const [key, platform] of Object.entries(PLATFORMS)) {
      if (key === 'generic') continue; // Check generic last
      
      if (platform.detect()) {
        log(`✅ Detected: ${platform.name}`);
        return key;
      }
    }
    
    log('ℹ️ Using generic form handler');
    return 'generic';
  }

  // ================================
  // FIELD FINDER (PLATFORM-SPECIFIC)
  // ================================
  function findField(platform, fieldKey) {
    const selectors = PLATFORMS[platform].fields[fieldKey];
    if (!selectors) return null;

    const selectorList = Array.isArray(selectors) ? selectors : [selectors];

    for (const selector of selectorList) {
      // Try as CSS selector
      try {
        const el = document.querySelector(`input[name*="${selector}"], input[id*="${selector}"], textarea[name*="${selector}"], select[name*="${selector}"], ${selector}`);
        if (el) {
          log(`  ✓ Found ${fieldKey}: ${selector}`);
          return el;
        }
      } catch (e) {
        // Invalid selector, try as attribute value
        const inputs = document.querySelectorAll('input, textarea, select');
        for (const input of inputs) {
          const name = (input.name || '').toLowerCase();
          const id = (input.id || '').toLowerCase();
          const placeholder = (input.placeholder || '').toLowerCase();
          
          if (name.includes(selector) || id.includes(selector) || placeholder.includes(selector)) {
            log(`  ✓ Found ${fieldKey}: matched "${selector}"`);
            return input;
          }
        }
      }
    }

    log(`  ✗ Not found: ${fieldKey}`);
    return null;
  }

  // ================================
  // VALUE SETTER (ENHANCED)
  // ================================
  function setValue(el, value) {
    if (!el || !value) return false;

    const tag = el.tagName.toLowerCase();
    const type = (el.type || '').toLowerCase();

    try {
      // Handle different input types
      if (tag === 'select') {
        // Dropdown
        const opts = Array.from(el.options || []);
        for (const opt of opts) {
          if (opt.value.toLowerCase().includes(value.toLowerCase()) || 
              opt.text.toLowerCase().includes(value.toLowerCase())) {
            el.value = opt.value;
            break;
          }
        }
      } else if (type === 'checkbox' || type === 'radio') {
        // Checkbox/Radio
        const val = String(value).toLowerCase();
        el.checked = ['yes', 'true', '1', 'y'].includes(val);
      } else if (type === 'file') {
        // File upload - can't set programmatically
        log(`    ⚠️ File input detected (${el.name}) - please upload manually`);
        return false;
      } else {
        // Text input
        el.value = value;
      }

      // Trigger events for React/Angular/Vue
      ['input', 'change', 'blur'].forEach(eventType => {
        el.dispatchEvent(new Event(eventType, { bubbles: true }));
      });

      // Special handling for React (set native value)
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      }

      log(`    ✓ Set "${el.name || el.id}" to: "${String(value).slice(0, 50)}"`);
      return true;
    } catch (e) {
      console.error('Error setting value:', e);
      return false;
    }
  }

  // ================================
  // PLATFORM-SPECIFIC FILL LOGIC
  // ================================
  async function fillForm(platform, profile) {
    log(`\n📝 Filling ${PLATFORMS[platform].name} form...`);
    
    const platformConfig = PLATFORMS[platform];
    let filledCount = 0;
    const fieldsToFill = Object.keys(platformConfig.fields);

    for (const fieldKey of fieldsToFill) {
      const el = findField(platform, fieldKey);
      if (el && profile[fieldKey]) {
        if (setValue(el, profile[fieldKey])) {
          filledCount++;
        }
      }
    }

    // Handle custom questions for specific platforms
    if (platform === 'greenhouse' && platformConfig.customQuestions) {
      log('\n🔍 Looking for custom questions...');
      const allInputs = document.querySelectorAll('input, select, textarea');
      
      for (const input of allInputs) {
        if (input.value) continue; // Skip if already filled
        
        const label = getFieldLabel(input);
        if (!label) continue;

        for (const [question, profileKey] of Object.entries(platformConfig.customQuestions)) {
          if (label.includes(question) && profile[profileKey]) {
            if (setValue(input, profile[profileKey])) {
              filledCount++;
              log(`  ✓ Answered custom question: "${question}"`);
            }
          }
        }
      }
    }

    log(`\n✨ Filled ${filledCount} fields`);
    return filledCount;
  }

  // ================================
  // HELPER: GET FIELD LABEL
  // ================================
  function getFieldLabel(el) {
    try {
      // Try label element
      if (el.labels && el.labels[0]) {
        return el.labels[0].innerText.toLowerCase();
      }
      
      // Try aria-label
      const ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel.toLowerCase();

      // Try placeholder
      const placeholder = el.getAttribute('placeholder');
      if (placeholder) return placeholder.toLowerCase();

      // Try parent text
      const parent = el.closest('div, fieldset, label');
      if (parent) {
        return (parent.innerText || '').toLowerCase().slice(0, 200);
      }
    } catch (e) {}
    
    return '';
  }

  // ================================
  // AUTO-SUBMIT
  // ================================
  function autoSubmit(platform) {
    const selector = PLATFORMS[platform].submitButton;
    const button = document.querySelector(selector);
    
    if (button && !button.disabled) {
      log(`\n🚀 Auto-submitting via button`);
      button.click();
      return true;
    }
    
    log('⚠️ Submit button not found or disabled');
    return false;
  }

  // ================================
  // PUBLIC API
  // ================================
  window.__JOB_AUTOFILL_FILL = async function(profile, options = {}) {
    console.clear();
    console.log('%c🎯 JOB AUTOFILL SYSTEM', 'font-size: 20px; font-weight: bold; color: #4CAF50');
    console.log('==========================================\n');

    // Detect or use specified platform
    let platform = options.platform || detectPlatform();
    
    // Validate platform
    if (!PLATFORMS[platform]) {
      console.error(`❌ Unknown platform: ${platform}`);
      console.log('Available platforms:', Object.keys(PLATFORMS).join(', '));
      return { error: 'Unknown platform' };
    }

    console.log(`📱 Platform: ${PLATFORMS[platform].name}`);
    console.log(`👤 Profile:`, profile);
    console.log('\n');

    // Fill the form
    const filledCount = await fillForm(platform, profile);

    // Auto-submit if requested
    if (options.autoSubmit) {
      setTimeout(() => autoSubmit(platform), 1000);
    }

    console.log('\n✅ Autofill complete!');
    return { ok: true, platform, filledCount };
  };

  // ================================
  // HELPER: SHOW AVAILABLE PLATFORMS
  // ================================
  window.__JOB_AUTOFILL_PLATFORMS = function() {
    console.log('\n📋 Supported Platforms:\n');
    for (const [key, platform] of Object.entries(PLATFORMS)) {
      console.log(`  • ${platform.name} → platform: "${key}"`);
    }
    console.log('\nUsage: window.__JOB_AUTOFILL_FILL(profile, { platform: "greenhouse" })');
  };

  console.log('✅ Multi-Platform Job Autofill Loaded!');
  console.log('Commands:');
  console.log('  • window.__JOB_AUTOFILL_FILL(profile) - Auto-detect and fill');
  console.log('  • window.__JOB_AUTOFILL_PLATFORMS() - List platforms');
})();