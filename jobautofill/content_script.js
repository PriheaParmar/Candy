// content_script.js
(function(){
  // utility: dispatch events so frameworks notice changes
  function dispatchEvents(el){
    ['input','change','blur'].forEach(ev => {
      const e = new Event(ev, {bubbles:true, cancelable:true});
      try { el.dispatchEvent(e); } catch(e) {}
    });
  }

  // lower-case normalizer
  function norm(s){ return (s||'').toString().toLowerCase().trim(); }

  // find label for input
  function labelTextFor(input){
    try{
      if (input.labels && input.labels.length) {
        return Array.from(input.labels).map(l=>l.innerText).join(' ').trim();
      }
      // fallback: sibling label
      let l = input.closest('label');
      if (l) return l.innerText || '';
      // try previous sibling
      const prev = input.previousElementSibling;
      if (prev && prev.tagName.toLowerCase() === 'label') return prev.innerText||'';
    }catch(e){}
    return '';
  }

  // heuristic matching: a list of keywords -> profile path retrieval
  const fieldMap = [
    {keys:['first name','firstname','given name','given_name','first'], path: ['nameData','firstName']},
    {keys:['last name','lastname','surname','family name','last'], path: ['nameData','lastName']},
    {keys:['preferred name','preferredname'], path: ['nameData','preferredName']},
    {keys:['email','e-mail','email address','mail'], path: ['contactData','email']},
    {keys:['phone','mobile','telephone','contact'], path: ['contactData','phoneNumber']},
    {keys:['address','street','address1','line1','address line','address 1'], path: ['addressData','line1']},
    {keys:['address2','line2'], path: ['addressData','line2']},
    {keys:['city'], path: ['addressData','city']},
    {keys:['state','province'], path: ['addressData','state']},
    {keys:['zip','postal','postal code','zipcode'], path: ['addressData','postalCode']},
    {keys:['country'], path: ['addressData','country']},
    {keys:['linkedin url','linkedin'], path: ['websiteData','linkedin']},
    {keys:['resume','cv','upload resume','upload cv'], path: ['resumeData','fileName']},
    {keys:['education','school','degree','university'], path: ['educationData']}, // array
    {keys:['skills'], path: ['skillsData']}, // array
    {keys:['job title','current title','title','current position'], path: ['jobData','0','jobTitle']},
    {keys:['company','current company'], path: ['jobData','0','company']}
  ];

  function getByPath(profile, pathArr){
    if (!profile || !pathArr) return null;
    let cur = profile;
    for(const p of pathArr){
      if (cur === undefined || cur === null) return null;
      // if numeric string like '0', handle arrays
      if (/^\d+$/.test(p)) {
        cur = cur[Number(p)];
      } else {
        cur = cur[p];
      }
    }
    return cur;
  }

  // returns candidate mapping of many simple tokens
  function buildKV(profile){
    const kv = {};
    fieldMap.forEach(m => {
      const val = getByPath(profile, m.path);
      if (val === undefined || val === null) return;
      // create keys for each alias
      m.keys.forEach(k => kv[k] = Array.isArray(val) ? val.join(', ') : val);
    });

    // also inject generic name variants
    try {
      const fn = getByPath(profile, ['nameData','firstName']) || '';
      const ln = getByPath(profile, ['nameData','lastName']) || '';
      kv['fullname'] = (fn + ' ' + ln).trim();
      kv['first'] = fn;
      kv['last'] = ln;
      kv['email'] = getByPath(profile, ['contactData','email']);
      kv['phone'] = getByPath(profile, ['contactData','phoneNumber']);
    } catch(e){}
    return kv;
  }

  // heuristic field matching: returns best value for a given input element
  function findValueForElement(el, kv){
    const candidates = [];
    const checkText = [
      el.id || '',
      el.name || '',
      el.placeholder || '',
      el.getAttribute('aria-label') || '',
      labelTextFor(el) || ''
    ].map(s => norm(s)).filter(Boolean).join(' | ');

    // exact keyword detection
    Object.keys(kv).forEach(k => {
      if (!kv[k]) return;
      const key = norm(k);
      if (checkText.indexOf(key) !== -1) {
        candidates.push({score: 100 + key.length, key: k, val: kv[k]});
      }
    });

    // partial keyword detection
    Object.keys(kv).forEach(k => {
      if (!kv[k]) return;
      const key = norm(k);
      if (checkText.includes(key.split(' ')[0])) {
        candidates.push({score: 50 + key.length, key: k, val: kv[k]});
      }
    });

    // fallback: common field detection
    const commonMap = [
      {pattern: /name|full.?name/, key: 'fullname'},
      {pattern: /first/, key: 'first'},
      {pattern: /last|surname/, key: 'last'},
      {pattern: /email|e-?mail/, key: 'email'},
      {pattern: /phone|mobile|telephone/, key: 'phone'},
      {pattern: /address|street|line1/, key: 'address'},
      {pattern: /city/, key: 'city'},
      {pattern: /state|province/, key: 'state'},
      {pattern: /zip|postal/, key: 'zip'},
    ];
    for(const cm of commonMap){
      if (cm.pattern.test(checkText) && kv[cm.key]) {
        candidates.push({score: 20, key: cm.key, val: kv[cm.key]});
      }
    }

    if (!candidates.length) return null;
    candidates.sort((a,b)=>b.score-a.score);
    return candidates[0].val;
  }

  // fill a single element with a value
  function fillElement(el, value){
    if (!el || value === undefined || value === null) return false;
    // handle select
    if (el.tagName.toLowerCase() === 'select'){
      // try to find option by text or value
      const options = Array.from(el.options);
      let found = options.find(o => norm(o.value) === norm(value) || norm(o.text) === norm(value));
      if (found) {
        el.value = found.value;
        dispatchEvents(el);
        return true;
      } else {
        // try partial match
        found = options.find(o => norm(o.text).includes(norm(value)) || norm(o.value).includes(norm(value)));
        if (found) { el.value = found.value; dispatchEvents(el); return true; }
      }
      return false;
    }

    // checkbox/radio: if value is boolean or matches label
    if (el.type === 'checkbox' || el.type === 'radio'){
      const want = (''+value).toLowerCase();
      const checkedIf = (want === 'true' || want === 'yes' || want === '1' || want === 'y');
      el.checked = checkedIf;
      dispatchEvents(el);
      return true;
    }

    // standard text, email, tel, textarea
    try {
      el.focus();
      el.value = value;
      dispatchEvents(el);
      return true;
    } catch(e){ return false; }
  }

  // site-specific mappings (example for LinkedIn & Indeed). Add others similarly.
  const siteMappings = {
    // example LinkedIn apply page mapping (class names / selectors may change — keep them updated)
    'www.linkedin.com': function(profile){
      const kv = buildKV(profile);
      const ret = {filled:0, attempted:0};
      // LinkedIn often uses specialized name/email selectors — fallback to generic logic
      const selectors = [
        'input[name*="email"]',
        'input[name*="firstName"]',
        'input[name*="lastName"]',
        'input[placeholder*="Phone"]',
        'input[aria-label*="Phone"]'
      ];
      document.querySelectorAll('input, textarea, select').forEach(el => {
        const val = findValueForElement(el, kv);
        if (val) { if (fillElement(el, val)) ret.filled++; ret.attempted++; }
      });
      return ret;
    },
    'www.indeed.com': function(profile){
      const kv = buildKV(profile);
      const ret = {filled:0, attempted:0};
      document.querySelectorAll('input,textarea,select').forEach(el=>{
        const val = findValueForElement(el, kv);
        if (val){ if (fillElement(el, val)) ret.filled++; ret.attempted++; }
      });
      return ret;
    }
  };

  // message handling from popup
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (!msg || !msg.action) return;
    const profile = msg.profile;
    if (!profile) return sendResponse({status:'no profile'});
    const host = window.location.host;
    const domain = host.replace(/^www\./,'').split(':')[0];
    // choose mapping
    let out;
    const mappingKey = Object.keys(siteMappings).find(k => host.includes(k) || domain.includes(k));
    if (mappingKey) {
      out = siteMappings[mappingKey](profile);
    } else {
      // generic fallback heuristics
      const kv = buildKV(profile);
      let filled = 0, attempted = 0;
      document.querySelectorAll('input,textarea,select').forEach(el => {
        // avoid password, hidden, irrelevant fields
        const type = (el.type||'').toLowerCase();
        if (['hidden','password','submit','button','reset','file'].includes(type)) return;
        // skip disabled
        if (el.disabled) return;
        const value = findValueForElement(el, kv);
        if (value) {
          attempted++;
          if (fillElement(el, value)) filled++;
        }
      });
      out = {filled, attempted};
    }

    // helpful result data
    sendResponse({status:'done', result: out});
    return true;
  });

})();
