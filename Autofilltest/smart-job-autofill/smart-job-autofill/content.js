// ==============================================================================
// JOB APPLICATION AUTOFILL SCRIPT
// ==============================================================================
// This script automatically fills job application forms by matching form fields
// to a user profile object based on intelligent keyword matching.
// ==============================================================================

(function() {
  // ================================
  // DEBUG CONFIGURATION
  // ================================
  // Toggle this to see console logs during development
  const DEBUG = false;
  
  // Wrapper function that only logs when DEBUG is true
  const log = (...args) => DEBUG && console.log('[JobAutofill]', ...args);

  // ================================
  // FIELD HINT EXTRACTION
  // ================================
  /**
   * Extracts all identifying information from a form field element.
   * This creates a "hint string" by combining various HTML attributes,
   * labels, and ARIA properties that might indicate what the field is for.
   * 
   * @param {HTMLElement} el - The form field element to analyze
   * @returns {string} - Lowercase string containing all hints about the field's purpose
   */
  function fieldHints(el) {
    // Return empty string if no element provided
    if (!el) return '';

    // List of HTML attributes that commonly identify a field's purpose
    // Includes standard attributes, data attributes, Angular/React props, and ARIA labels
    const attrs = [
      'name',              // Standard form field name
      'id',                // Element ID
      'placeholder',       // Placeholder text
      'aria-label',        // Accessibility label
      'title',             // Tooltip text
      'data-name',         // Custom data attributes
      'data-testid',       // Test identifiers
      'data-field',
      'data-placeholder',
      'data-qa',           // Quality assurance identifiers
      'data-cy',           // Cypress test identifiers
      'data-test',
      'data-test-id',
      'formcontrolname',   // Angular form control name
      'ng-reflect-name',   // Angular reflected name
      'for',               // Label association
      'autocomplete',      // Browser autocomplete hint
      'type',              // Input type (text, email, etc.)
      'role',              // ARIA role
      'aria-describedby',  // ID of describing element
      'aria-labelledby',   // ID of labeling element
      'data-id',
      'data-role',
      'aria-placeholder'
    ];

    // Array to store all hint strings we find
    const hints = [];
    
    // Extract values from all relevant attributes
    attrs.forEach(a => {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) hints.push(v);
    });

    // Try to find and extract label text associated with this field
    try {
      // Check if element has associated <label> elements
      if (el.labels && el.labels.length) {
        for (const lab of el.labels) {
          if (lab.innerText) hints.push(lab.innerText);
        }
      } 
      // If no direct labels, try to find label by ID reference
      else if (el.id) {
        const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (lab && lab.innerText) hints.push(lab.innerText);
      }
    } catch {}

    // Extract text from aria-describedby element (often contains helper text)
    const describedby = el.getAttribute('aria-describedby');
    if (describedby) {
      const desc = document.getElementById(describedby);
      if (desc && desc.textContent) hints.push(desc.textContent);
    }

    // Combine all hints, normalize whitespace, and convert to lowercase for matching
    return hints.join(' ').replace(/\s+/g, ' ').toLowerCase();
  }

  // ================================
  // KEYWORD DEFINITIONS
  // ================================
  /**
   * Comprehensive mapping of profile data keys to common field identifiers.
   * Each key maps to an array of keywords/phrases that might appear in form fields.
   * Keywords are in priority order (most specific first).
   */
  const KEYWORDS = {
    // ---- Basic Identity ----
    fullName: ['full name','fullname','applicant name','candidate name','name'],
    firstName: ['first name','fname','given name','first'],
    middleName: ['middle name','mname'],
    lastName: ['last name','lname','surname','family name','lastname'],
    password: ['password','pass','pwd'],
    confirmPassword: ['confirm password','verify password','re-enter password','confirm pwd'],

    // ---- Contact Information ----
    email: ['email','e-mail','mail', 'email address'],
    phone: ['phone','telephone','mobile','cell','contact','phone number'],
    phoneCode: ['country code','dial code','isd','phone code'],
    address: ['address','street','addr','address line','address1','address2'],
    city: ['city','town','locality'],
    state: ['state','province','region','territory','zone'],
    zip: ['zip','postal','postcode','pin','zip code','postal code'],
    country: ['country','nation','country/territory','territory'],

    // ---- Work Authorization & Eligibility ----
    workAuth: ['work authorization','work auth','visa status','work permit','employment eligibility','eligible to work'],
    sponsorship: ['require sponsorship','visa sponsorship','need visa','work visa needed'],
    authorizedToWorkUS: ['authorized to work in us','eligible to work in the us','legally work in us'],
    willingToRelocate: ['willing to relocate','open to relocation','ready to relocate','relocation preference'],
    availableImmediately: ['available immediately','immediate joiner','notice period 0','start immediately'],

    // ---- Employment History ----
    company: ['current company','company','employer','organization'],
    jobTitle: ['job title','position','role','designation'],
    experience: ['experience','years experience','work experience','total experience'],
    startDate: ['start date','available from','availability','joining date'],
    salary: ['salary','expected salary','pay','compensation','desired salary','current salary'],
    summary: ['summary','about','about me','bio','profile','professional summary'],
    skills: ['skills','technical skills','skillset','competencies','expertise'],

    // ---- Education ----
    degree: ['degree','qualification','education level','major'],
    university: ['university','college','school','institute'],
    graduationYear: ['graduation year','year of graduation','grad year'],
    gpa: ['gpa','grade point average','cgpa','marks'],

    // ---- Online Profiles ----
    linkedin: ['linkedin','linkedin url','linkedin profile'],
    website: ['website','portfolio','personal website','github','gitlab','behance','dribbble'],

    // ---- Personal Information ----
    dob: ['date of birth','birthdate','birthday','dob'],
    gender: ['gender','sex'],
    ethnicity: ['ethnicity','race','ethnic background','racial identity'],
    citizenship: ['citizenship','nationality','citizen of'],
    veteran: ['veteran','veteran status'],
    disability: ['disability','handicap'],
    deviceType: ['device type','platform','device used'],
    timezone: ['timezone','time zone'],
    location: ['current location','location','city of residence'],
    preferredLocation: ['preferred location','desired location','work location preference'],

    // ---- Application Details ----
    referral: ['referral','referred by','referrer','who referred you'],
    hearAbout: ['how did you hear','source','job source'],
    coverLetter: ['cover letter','motivation letter','why do you want'],

    // ---- File Uploads ----
    resume: ['resume','cv','upload resume','attach cv'],
    portfolioFile: ['portfolio file','upload portfolio'],
    transcript: ['transcript','academic record'],

    // ---- Additional Application Fields ----
    availableToStart: ['available to start','start date','when can you start','availability date'],
    previouslyEmployed: ['previously employed','worked here before','former employee','past employment with us'],
    highSchool: ['high school','diploma','secondary school','high school diploma'],
    forbidden: ['forbidden','prohibited','barred','restricted'],
    backgroundScreening: ['background screening','background check','background verification','criminal background'],
    drugTest: ['drug test','drug screening','substance test','willing to take drug test'],
    eligibleToPerformTasks: ['eligible to perform tasks','able to perform','capable of performing','perform essential functions'],
    spokenLanguages: ['spoken languages','languages spoken','language proficiency','fluent in'],
    yearsOfExperience: ['years of experience','years experience','total years','experience in years'],
    workBefore: ['work before','worked before','previous work','prior employment'],
    securityClearance: ['security clearance','clearance level','security level','clearance status'],
    verifyingPassword: ['verifying password','confirm password','password confirmation','re-enter password'],
    verifyingEmail: ['verifying email','confirm email','email confirmation','re-enter email'],
    everRegistered: ['ever registered','previously registered','already registered','registered before'],
    hearAboutSource: ['how did you hear','where did you hear','hear about us','source of application'],
    legalStatus: ['legal status','immigration status','work status','visa status'],
    essentialFunctions: ['essential functions','job functions','core duties','primary responsibilities'],
    legalAge: ['legal age','minimum age','age requirement','18 years old'],
    drivingLicense: ['driving license','driver license','driver\'s license','valid license'],
    willingToWorkOnSite: ['willing to work on site','work onsite','on-site work','office based'],
    salaryType: ['salary type','pay type','compensation type','hourly or annual','payment frequency'],
    everWorkedAtCompany: ['ever worked at company','worked here before','previously employed here','past employee']
  };

  // ================================
  // KEYWORD MATCHING LOGIC
  // ================================
  /**
   * Calculates a match score between a field's hints and a profile data key.
   * Higher scores indicate better matches.
   * 
   * @param {string} hint - The lowercase hint string from the field
   * @param {string} key - The profile data key to check against
   * @returns {number} - Match score (0 = no match, higher = better match)
   */
  function matchScore(hint, key) {
    let score = 0;
    const words = KEYWORDS[key];
    if (!words) return 0;

    // Check each keyword associated with this profile key
    for (const w of words) {
      // Exact substring match gets highest points
      if (hint.includes(w)) {
        score += 5;
      } 
      // Partial word match gets lower points
      // (e.g., "first" in hint matches "first name" keyword)
      else if (hint.split(/\W+/).some(token => w.includes(token))) {
        score += 2;
      }
    }

    // Bonus points if the hint contains the actual key name
    // (e.g., "email" field for "email" key)
    if (hint.includes(key.toLowerCase())) {
      score += 3;
    }
    
    return score;
  }

  /**
   * Checks if a field should be excluded from autofill based on its context.
   * Prevents filling in fields that are asking questions or require custom answers.
   * 
   * @param {string} hint - The lowercase hint string from the field
   * @returns {boolean} - True if field should be skipped
   */
  function shouldSkipField(hint) {
    // Skip fields that are clearly asking for essay/paragraph responses
    const questionIndicators = [
      'describe', 'explain', 'why', 'how you', 'give an example',
      'what did you learn', 'what worked', 'approach', 'influenced',
      'rate your', 'on a scale', 'reasoning', 'successfully',
      'contributed to', 'project you led', 'best practices'
    ];
    
    return questionIndicators.some(indicator => hint.includes(indicator));
  }

  // ================================
  // MAIN FIELD MATCHING & FILLING
  // ================================
  /**
   * Core function that finds form fields and fills them with profile data.
   * Uses intelligent matching to determine which profile field goes in which form field.
   * 
   * @param {Object} profile - User profile data to fill into the form
   * @returns {Object} - Map of which profile keys were successfully assigned
   */
  function findAndFill(profile) {
    // Get all fillable form elements on the page
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    
    // Track which profile keys have been assigned to avoid duplicates
    const assigned = {};

    // PHASE 1: Score-based matching
    // For each form field, find the best matching profile key
    for (const el of inputs) {
      // Skip disabled or read-only fields
      if (el.disabled || el.readOnly) continue;
      
      // Extract identifying information from this field
      const hint = fieldHints(el);
      if (!hint) continue;

      // Skip fields that look like essay questions or custom responses
      if (shouldSkipField(hint)) {
        log('Skipping question field:', hint.slice(0, 50));
        continue;
      }

      // Find the profile key with the highest match score
      let bestKey = null;
      let bestScore = 0;
      for (const key of Object.keys(KEYWORDS)) {
        // Skip if this key is already assigned or has no value in profile
        if (assigned[key] || !profile[key]) continue;
        
        // Calculate match score
        const s = matchScore(hint, key);
        if (s > bestScore) {
          bestScore = s;
          bestKey = key;
        }
      }

      // If we found a good match (score >= 5), fill the field
      if (bestKey && bestScore >= 5) {
        setValue(el, profile[bestKey]);
        assigned[bestKey] = true;
        log('Matched', bestKey, '→', el, bestScore);
      }
    }

    // PHASE 2: Fallback heuristic matching
    // For any remaining unmatched fields, try simple substring matching
    for (const el of inputs) {
      if (el.disabled || el.readOnly) continue;
      const hint = fieldHints(el);
      if (!hint) continue;

      // Check if hint contains any profile key name directly
      for (const key of Object.keys(profile)) {
        if (assigned[key] || !profile[key]) continue;
        
        // Simple substring match as fallback
        if (hint.includes(key.toLowerCase())) {
          setValue(el, profile[key]);
          assigned[key] = true;
          break; // Only assign one value per field
        }
      }
    }
    
    return assigned;
  }

  // ================================
  // VALUE SETTING LOGIC
  // ================================
  /**
   * Sets a value on a form field with proper handling for different input types.
   * Triggers appropriate events to ensure framework compatibility (React, Angular, etc.)
   * 
   * @param {HTMLElement} el - The form field element to set
   * @param {*} value - The value to set
   */
  function setValue(el, value) {
    // Skip null/undefined values
    if (value === undefined || value === null) return;
    
    // Skip if element is not a valid form field
    if (!el || !el.tagName) return;

    const type = (el.type || '').toLowerCase();
    const tag = el.tagName.toLowerCase();

    try {
      // Handle <select> dropdowns
      if (tag === 'select') {
        const opts = Array.from(el.options || []);
        
        // Try to find matching option by value or text
        let matched = false;
        for (const o of opts) {
          const optValue = (o.value || '').toLowerCase();
          const optText = (o.text || '').toLowerCase();
          const searchValue = String(value).toLowerCase();
          
          if (optValue === searchValue || optText === searchValue || 
              optText.includes(searchValue) || searchValue.includes(optText)) {
            el.value = o.value;
            matched = true;
            break;
          }
        }
        
        // If no match found, don't set value (prevents errors)
        if (!matched) {
          log('No matching option found for', value, 'in', el);
          return;
        }
      } 
      // Handle checkboxes and radio buttons
      else if (['checkbox','radio'].includes(type)) {
        setBoolean(el, value);
        // Return early, setBoolean handles events
        return;
      } 
      // Handle date inputs with proper formatting
      else if (type === 'date') {
        const d = new Date(value);
        // Convert to ISO date format (YYYY-MM-DD) if valid date
        el.value = isNaN(d) ? value : d.toISOString().slice(0,10);
      }
      // Handle file inputs (skip them)
      else if (type === 'file') {
        log('Skipping file input', el);
        return;
      }
      // Handle regular text inputs, textareas, etc.
      else if (tag === 'input' || tag === 'textarea') {
        // Only try to focus if element is visible and focusable
        if (el.offsetParent !== null && typeof el.focus === 'function') {
          try {
            el.focus();
          } catch {}
        }
        el.value = String(value).trim();
      }
      // Unknown element type, skip it
      else {
        log('Unknown element type', tag, type, el);
        return;
      }

      // Dispatch events to trigger framework change detection
      // These events are crucial for React, Angular, Vue, etc.
      if (el.dispatchEvent) {
        try {
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          el.dispatchEvent(new Event('blur', { bubbles: true }));
        } catch (e) {
          log('Error dispatching events', e);
        }
      }
    } catch (e) {
      console.warn('Error setting value on element:', e, el, 'value:', value);
    }
  }

  /**
   * Helper function to set boolean values on checkboxes/radio buttons.
   * Interprets various truthy string values.
   * 
   * @param {HTMLElement} el - Checkbox or radio button element
   * @param {*} value - Value to interpret as boolean
   */
  function setBoolean(el, value) {
    if (!el || !el.tagName) return;
    
    try {
      const valStr = String(value).toLowerCase();
      // List of values that should be interpreted as "true"
      const isTrue = ['true','yes','1','y'].includes(valStr);
      el.checked = isTrue;
      
      // Dispatch events
      if (el.dispatchEvent) {
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('click', { bubbles: true }));
      }
    } catch (e) {
      log('Error setting boolean', e, el);
    }
  }

  // ================================
  // PUBLIC API
  // ================================
  /**
   * Main public function exposed to external scripts.
   * Call this to autofill a form with profile data.
   * 
   * Usage: window.__JOB_AUTOFILL_FILL({ firstName: 'John', email: 'john@example.com' })
   * 
   * @param {Object} profile - User profile data with keys matching KEYWORDS
   * @param {Object} options - Configuration options
   * @param {boolean} options.autoSubmit - Whether to automatically submit the form after filling
   * @returns {Object} - Result object with success status and assigned fields
   */
  window.__JOB_AUTOFILL_FILL = function(profile, options = {}) {
    // Validate input
    if (!profile || typeof profile !== 'object') {
      return { error: 'Invalid profile' };
    }

    // Execute the autofill
    const assigned = findAndFill(profile);
    log('Assigned', assigned);

    // Optionally auto-submit the form after a short delay
    if (options.autoSubmit) {
      setTimeout(tryAutoSubmit, 400);
    }
    
    return { ok: true, assigned };
  };

  // ================================
  // AUTO-SUBMIT FUNCTIONALITY
  // ================================
  /**
   * Attempts to automatically submit the form by finding and clicking
   * a submit button or calling form.submit().
   */
  function tryAutoSubmit() {
    // Look for submit buttons by text content
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    for (const b of buttons) {
      const t = (b.innerText || b.value || '').toLowerCase();
      
      // Common submit button text patterns
      if (['submit','apply','send','finish','next','continue'].some(k => t.includes(k))) {
        b.click();
        log('Auto-submitted via', b);
        return;
      }
    }
    
    // Fallback: submit first form on page directly
    const forms = document.forms;
    if (forms[0]) forms[0].submit();
  }

  // ================================
  // EVENT-BASED API (ALTERNATIVE)
  // ================================
  /**
   * Alternative way to trigger autofill using a custom event.
   * This allows triggering from content scripts or other isolated contexts.
   * 
   * Usage:
   * window.dispatchEvent(new CustomEvent('jobAutofill_fill', {
   *   detail: { profile: {...}, options: {...} }
   * }));
   */
  window.addEventListener('jobAutofill_fill', e => {
    const { profile, options } = e.detail || {};
    window.__JOB_AUTOFILL_FILL(profile, options);
  });
})();