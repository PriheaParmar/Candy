// content.js
(function(){  // wrapper function ( wraps entire code)
  
  function fieldHints(el) { // utility function to extract hints from a form field
    const hints = []; // create an array to hold hints
    if (!el) return ''; 
    const attrs = ['name','id','placeholder','aria-label','title'];
    attrs.forEach(a=>{
      const v = el.getAttribute && el.getAttribute(a);
      if (v) hints.push(v);
    });
    // try associated label
    try {
      if (el.labels && el.labels.length) {
        for (const lab of el.labels) {
          if (lab.innerText) hints.push(lab.innerText);
        }
      } else {
        // search for label[for=el.id]
        const id = el.id;
        if (id) {
          const lab = document.querySelector(`label[for="${CSS.escape(id)}"]`);
          if (lab) hints.push(lab.innerText);
        }
      }
    } catch(e){}
    return hints.join(' ').toLowerCase();
  }

  // mapping keys -> heuristic keywords
  const KEYWORDS = {
    fullName: ['full name','fullname','applicant name','candidate name','name'],
    firstName: ['first name','fname','given name','givenname','first'],
    lastName: ['last name','lname','surname','family name','lastname'],
    email: ['email','e-mail','e mail','mail'],
    phone: ['phone','telephone','mobile','contact'],
    address: ['address','addr','street','address1','address line'],
    city: ['city','town'],
    state: ['state','province','region'],
    zip: ['zip','postal','postcode','pin'],
    country: ['country','nation'],
    linkedin: ['linkedin','linkedin url','linkedin profile'],
    website: ['website','portfolio','website url','personal website'],
    degree: ['degree','qualification'],
    university: ['university','college','school','institute'],
    graduationYear: ['graduation year','grad year','year of graduation','graduation'],
    company: ['current company','company','employer'],
    jobTitle: ['job title','title','position','role'],
    experience: ['experience','years experience','years'],
    skills: ['skills','technical skills','skillset'],
    summary: ['summary','about','about me','bio','profile','professional summary'],
    coverLetter: ['cover letter','coverletter','why','motivation'],
    salary: ['salary','expected salary','pay','compensation'],
    startDate: ['start date','available from','availability','availability date'],
    citizenship: ['citizenship','nationality'],
    workAuth: ['work authorization','work auth','workpermit','work permit','eligible to work'],
    veteran: ['veteran'],
    disability: ['disability'],
    gender: ['gender','sex'],
    race: ['race','ethnicity'],
    referral: ['referral','referred by','referrer']
  };

  // Helper: test if any keyword matches string
  function matchesKey(hint, key) {
    const words = KEYWORDS[key];
    if (!words) return false;
    for (const w of words) {
      if (hint.includes(w)) return true;
    }
    return false;
  }

  // Prefer explicit specific keys, fallback to generic 'name' etc.
  function findAndFill(profile) {
    const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
    const assigned = {};
    // First pass: exact idiomatic matching (explicit keywords)
    for (const el of inputs) {
      const hint = fieldHints(el);
      if (!hint) continue;
      for (const key of Object.keys(KEYWORDS)) {
        if (assigned[key]) continue; // already filled a best candidate
        if (!profile.hasOwnProperty(key)) continue;
        if (matchesKey(hint, key)) {
          setValue(el, profile[key]);
          assigned[key] = true;
        }
      }
    }

    // Second pass: generic name heuristics (e.g., 'name', 'email', 'phone')
    for (const el of inputs) {
      const hint = fieldHints(el);
      if (!hint) continue;
      if (el.disabled || el.readOnly) continue;

      if (!assigned.fullName && profile.fullName && (hint.includes('name') && !hint.includes('first') && !hint.includes('last'))) {
        setValue(el, profile.fullName);
        assigned.fullName = true;
        continue;
      }
      if (!assigned.email && profile.email && hint.includes('email')) {
        setValue(el, profile.email);
        assigned.email = true;
        continue;
      }
      if (!assigned.phone && profile.phone && (hint.includes('phone') || hint.includes('mobile') || hint.includes('telephone') || hint.includes('tel'))) {
        setValue(el, profile.phone);
        assigned.phone = true;
        continue;
      }
      if (!assigned.address && profile.address && hint.includes('address')) {
        setValue(el, profile.address);
        assigned.address = true;
        continue;
      }
      if (!assigned.city && profile.city && hint.includes('city')) {
        setValue(el, profile.city);
        assigned.city = true;
        continue;
      }
      if (!assigned.state && profile.state && hint.includes('state')) {
        setValue(el, profile.state);
        assigned.state = true;
        continue;
      }
      if (!assigned.zip && profile.zip && (hint.includes('zip') || hint.includes('postal') || hint.includes('post'))) {
        setValue(el, profile.zip);
        assigned.zip = true;
        continue;
      }
      if (!assigned.country && profile.country && hint.includes('country')) {
        setValue(el, profile.country);
        assigned.country = true;
        continue;
      }
      if (!assigned.linkedin && profile.linkedin && hint.includes('linkedin')) {
        setValue(el, profile.linkedin);
        assigned.linkedin = true;
        continue;
      }
      if (!assigned.website && profile.website && (hint.includes('website') || hint.includes('portfolio'))) {
        setValue(el, profile.website);
        assigned.website = true;
        continue;
      }
      if (!assigned.summary && profile.summary && (hint.includes('summary') || hint.includes('about') || hint.includes('bio'))) {
        setValue(el, profile.summary);
        assigned.summary = true;
        continue;
      }
      if (!assigned.coverLetter && profile.coverLetter && (hint.includes('cover') || hint.includes('motivation'))) {
        setValue(el, profile.coverLetter);
        assigned.coverLetter = true;
        continue;
      }
      if (!assigned.startDate && profile.startDate && (hint.includes('start date') || el.type === 'date' || hint.includes('available'))) {
        setValue(el, profile.startDate);
        assigned.startDate = true;
        continue;
      }
      if (!assigned.salary && profile.salary && (hint.includes('salary') || hint.includes('expected'))) {
        setValue(el, profile.salary);
        assigned.salary = true;
        continue;
      }
      // boolean flags - try to check checkboxes or radio when hint matches
      if ((hint.includes('work') && hint.includes('auth')) && profile.workAuth !== undefined) {
        setBoolean(el, profile.workAuth);
        assigned.workAuth = true;
        continue;
      }
    }

    // Third: fill remaining best-effort by matching any key word anywhere
    for (const el of inputs) {
      if (el.disabled || el.readOnly) continue;
      const hint = fieldHints(el);
      if (!hint) continue;
      for (const key of Object.keys(profile)) {
        if (!profile[key]) continue;
        if (assigned[key]) continue;
        // convert key name to human form and search
        if (hint.includes(key.toLowerCase())) {
          setValue(el, profile[key]);
          assigned[key] = true;
          break;
        }
      }
    }

    return assigned;
  }

  function setValue(el, value) {
    if (value === null || value === undefined) return;
    try {
      if (el.tagName.toLowerCase() === 'select') {
        // try to find matching option
        let matched = false;
        for (const o of el.options) {
          if (!o.value) continue;
          if (o.value.toLowerCase().includes(String(value).toLowerCase()) ||
              (o.text && o.text.toLowerCase().includes(String(value).toLowerCase()))) {
            el.value = o.value;
            matched = true;
            break;
          }
        }
        if (!matched && el.options.length === 1 && !el.options[0].value) {
          // single-line custom select, try to set text input style
          el.value = value;
        }
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      const type = el.type ? el.type.toLowerCase() : '';
      if (type === 'checkbox' || type === 'radio') {
        // radio/checkbox: if boolean or matching value
        setBoolean(el, value);
        return;
      }

      if (type === 'date') {
        // set to yyyy-mm-dd if possible
        try {
          const d = new Date(value);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth()+1).padStart(2,'0');
            const da = String(d.getDate()).padStart(2,'0');
            el.value = `${y}-${m}-${da}`;
          } else {
            el.value = value;
          }
        } catch (e) {
          el.value = value;
        }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }

      // default: set text/textarea/etc
      el.focus && el.focus();
      el.value = String(value);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {
      console.warn('setValue error', e, el, value);
    }
  }

  function setBoolean(el, value) {
    const type = el.type ? el.type.toLowerCase() : '';
    const valStr = String(value).toLowerCase();
    if (type === 'radio') {
      // try to find with same name and matching value or label
      const name = el.name;
      const group = document.querySelectorAll(`input[type="radio"][name="${CSS.escape(name)}"]`);
      for (const r of group) {
        const hint = fieldHints(r);
        if (valStr === 'true' || valStr === 'yes' || valStr === '1') {
          // pick the one that indicates yes/true
          if (hint.includes('yes') || hint.includes('true') || hint.includes('female') || hint.includes('male') || hint.includes(String(value).toLowerCase())) {
            r.checked = true;
            r.dispatchEvent(new Event('change', { bubbles: true }));
            return;
          }
        } else {
          if (hint.includes('no') || hint.includes('false') || hint.includes(String(value).toLowerCase())) {
            r.checked = true;
            r.dispatchEvent(new Event('change', { bubbles: true }));
            return;
          }
        }
      }
      // fallback: check first radio if truthy
      if (value) {
        const first = group[0];
        if (first) { first.checked = true; first.dispatchEvent(new Event('change',{bubbles:true})); }
      }
    } else if (type === 'checkbox') {
      const should = !!value;
      el.checked = should;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // fallback: try to set value
      setValue(el, value);
    }
  }

  function tryAutoSubmit() {
    // common submit buttons
    const candidateSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:not([type])',
      'input[type="button"]'
    ];
    const keywords = ['apply','submit','send','finish','save','continue','next','finalize','apply now'];
    for (const sel of candidateSelectors) {
      const nodes = Array.from(document.querySelectorAll(sel));
      for (const n of nodes) {
        const text = (n.innerText || n.value || '').toLowerCase();
        if (!text) continue;
        for (const kw of keywords) {
          if (text.includes(kw)) {
            try {
              n.click();
              console.log('JobAutofill: clicked submit button', n, text);
              return true;
            } catch (e) {
              console.warn('click failed', e);
            }
          }
        }
      }
    }
    // fallback: try first form submit
    const forms = document.forms;
    if (forms && forms.length) {
      try {
        forms[0].submit();
        console.log('JobAutofill: form.submit() fired');
        return true;
      } catch(e) {
        console.warn('form.submit failed', e);
      }
    }
    return false;
  }

  // exported function to run fill
  window.__JOB_AUTOFILL_FILL = function(profile, options={}) {
    try {
      if (!profile || typeof profile !== 'object') {
        console.warn('No profile provided');
        return { error: 'no profile' };
      }
      console.log('JobAutofill: running fill', profile);
      const assigned = findAndFill(profile);
      console.log('JobAutofill: assigned keys', assigned);
      if (options && options.autoSubmit) {
        setTimeout(() => {
          tryAutoSubmit();
        }, 400);
      }
      return { ok: true, assigned };
    } catch (e) {
      console.error('JobAutofill error', e);
      return { error: e.message };
    }
  };

  // fallback: listen for custom event from popup if content script wasn't available
  window.addEventListener('jobAutofill_fill', (ev) => {
    const { profile, options } = ev.detail || {};
    window.__JOB_AUTOFILL_FILL(profile, options);
  });
})();
