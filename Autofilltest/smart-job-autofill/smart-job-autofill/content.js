(function() {
  const DEBUG = false; // Toggle for console logs
  const log = (...args) => DEBUG && console.log('[JobAutofill]', ...args);

  // ================================
  // FIELD HINT EXTRACTION
  // ================================
  function fieldHints(el) {
    if (!el) return '';

    const attrs = [
      'name','id','placeholder','aria-label','title','data-name','data-testid','data-field',
      'data-placeholder','data-qa','data-cy','data-test','data-test-id','formcontrolname',
      'ng-reflect-name','for','autocomplete','type','role','aria-describedby','aria-labelledby',
      'data-id','data-role','aria-placeholder'
    ];

    const hints = [];
    attrs.forEach(a => {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) hints.push(v);
    });

    try {
      if (el.labels && el.labels.length) {
        for (const lab of el.labels) {
          if (lab.innerText) hints.push(lab.innerText);
        }
      } else if (el.id) {
        const lab = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (lab && lab.innerText) hints.push(lab.innerText);
      }
    } catch {}

    // Include placeholder-like aria text
    const describedby = el.getAttribute('aria-describedby');
    if (describedby) {
      const desc = document.getElementById(describedby);
      if (desc && desc.textContent) hints.push(desc.textContent);
    }

    return hints.join(' ').replace(/\s+/g, ' ').toLowerCase();
  }

  // ================================
  // KEYWORDS
  // ================================
  const KEYWORDS = {
    // Basic
    fullName: ['full name','fullname','applicant name','candidate name','name'],
    firstName: ['first name','fname','given name','first'],
    middleName: ['middle name','mname'],
    lastName: ['last name','lname','surname','family name','lastname'],
    password: ['password','pass','pwd'],
    confirmPassword: ['confirm password','verify password','re-enter password','confirm pwd'],

    // Contact
    email: ['email','e-mail','mail', 'email address'],
    phone: ['phone','telephone','mobile','cell','contact','phone number'],
    phoneCode: ['country code','dial code','isd','phone code'],
    address: ['address','street','addr','address line','address1','address2'],
    city: ['city','town','locality'],
    state: ['state','province','region','territory','zone'],
    zip: ['zip','postal','postcode','pin','zip code','postal code'],
    country: ['country','nation','country/territory','territory'],

    // Work & eligibility
    workAuth: ['work authorization','work auth','visa status','work permit','employment eligibility','eligible to work'],
    sponsorship: ['require sponsorship','visa sponsorship','need visa','work visa needed'],
    authorizedToWorkUS: ['authorized to work in us','eligible to work in the us','legally work in us'],
    willingToRelocate: ['willing to relocate','open to relocation','ready to relocate','relocation preference'],
    availableImmediately: ['available immediately','immediate joiner','notice period 0','start immediately'],

    // Employment
    company: ['current company','company','employer','organization'],
    jobTitle: ['job title','position','role','designation'],
    experience: ['experience','years experience','work experience','total experience'],
    startDate: ['start date','available from','availability','joining date'],
    salary: ['salary','expected salary','pay','compensation','desired salary','current salary'],
    summary: ['summary','about','about me','bio','profile','professional summary'],
    skills: ['skills','technical skills','skillset','competencies','expertise'],

    // Education
    degree: ['degree','qualification','education level','major'],
    university: ['university','college','school','institute'],
    graduationYear: ['graduation year','year of graduation','grad year'],
    gpa: ['gpa','grade point average','cgpa','marks'],

    // Links
    linkedin: ['linkedin','linkedin url','linkedin profile'],
    website: ['website','portfolio','personal website','github','gitlab','behance','dribbble'],

    // Personal
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

    // Application
    referral: ['referral','referred by','referrer','who referred you'],
    hearAbout: ['how did you hear','source','job source'],
    coverLetter: ['cover letter','motivation letter','why do you want'],

    // Files
    resume: ['resume','cv','upload resume','attach cv'],
    portfolioFile: ['portfolio file','upload portfolio'],
    transcript: ['transcript','academic record']
  };

  // ================================
  // MATCHING HELPER
  // ================================
  function matchScore(hint, key) {
    let score = 0;
    const words = KEYWORDS[key];
    if (!words) return 0;

    for (const w of words) {
      if (hint.includes(w)) score += 5;
      else if (hint.split(/\W+/).some(token => w.includes(token))) score += 2;
    }

    // Bonus: direct type clue
    if (hint.includes(key.toLowerCase())) score += 3;
    return score;
  }

  // ================================
  // MAIN LOGIC
  // ================================
  function findAndFill(profile) {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const assigned = {};

    // Score fields against keywords
    for (const el of inputs) {
      if (el.disabled || el.readOnly) continue;
      const hint = fieldHints(el);
      if (!hint) continue;

      let bestKey = null;
      let bestScore = 0;
      for (const key of Object.keys(KEYWORDS)) {
        if (assigned[key] || !profile[key]) continue;
        const s = matchScore(hint, key);
        if (s > bestScore) { bestScore = s; bestKey = key; }
      }

      if (bestKey && bestScore >= 5) {
        setValue(el, profile[bestKey]);
        assigned[bestKey] = true;
        log('Matched', bestKey, '→', el, bestScore);
      }
    }

    // Fallback heuristic (for unmatched)
    for (const el of inputs) {
      if (el.disabled || el.readOnly) continue;
      const hint = fieldHints(el);
      if (!hint) continue;

      for (const key of Object.keys(profile)) {
        if (assigned[key] || !profile[key]) continue;
        if (hint.includes(key.toLowerCase())) {
          setValue(el, profile[key]);
          assigned[key] = true;
          break;
        }
      }
    }
    return assigned;
  }

  // ================================
  // VALUE SETTING
  // ================================
  function setValue(el, value) {
    if (value === undefined || value === null) return;

    const type = (el.type || '').toLowerCase();
    const tag = el.tagName.toLowerCase();

    try {
      if (tag === 'select') {
        const opts = Array.from(el.options);
        for (const o of opts) {
          if (o.value.toLowerCase() === String(value).toLowerCase() ||
              o.text.toLowerCase() === String(value).toLowerCase()) {
            el.value = o.value;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            return;
          }
        }
        el.value = value;
      } else if (['checkbox','radio'].includes(type)) {
        setBoolean(el, value);
      } else if (type === 'date') {
        const d = new Date(value);
        el.value = isNaN(d) ? value : d.toISOString().slice(0,10);
      } else {
        el.focus?.();
        el.value = String(value).trim();
      }

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {
      console.warn('Error setting value', e, el);
    }
  }

  function setBoolean(el, value) {
    const valStr = String(value).toLowerCase();
    const isTrue = ['true','yes','1','y'].includes(valStr);
    el.checked = isTrue;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // ================================
  // PUBLIC API
  // ================================
  window.__JOB_AUTOFILL_FILL = function(profile, options = {}) {
    if (!profile || typeof profile !== 'object') return { error: 'Invalid profile' };

    const assigned = findAndFill(profile);
    log('Assigned', assigned);

    if (options.autoSubmit) setTimeout(tryAutoSubmit, 400);
    return { ok: true, assigned };
  };

  // Optional auto-submit
  function tryAutoSubmit() {
    const buttons = document.querySelectorAll('button, input[type="submit"]');
    for (const b of buttons) {
      const t = (b.innerText || b.value || '').toLowerCase();
      if (['submit','apply','send','finish','next','continue'].some(k => t.includes(k))) {
        b.click();
        log('Auto-submitted via', b);
        return;
      }
    }
    const forms = document.forms;
    if (forms[0]) forms[0].submit();
  }

  // Event fallback
  window.addEventListener('jobAutofill_fill', e => {
    const { profile, options } = e.detail || {};
    window.__JOB_AUTOFILL_FILL(profile, options);
  });
})();
