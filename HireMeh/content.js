// ------------------------
// Match calculation
// ------------------------
function calculateMatch(jobText, profile) {
  let text = jobText.toLowerCase();
  let skills = profile.skills.map(s => s.toLowerCase());

  // Skill match (70%)
  let matches = skills.filter(s => text.includes(s)).length;
  let skillScore = (matches / skills.length) * 70;

  // Experience match (30%)
  let expMatch = /(\d+)\+?\s+years?/.exec(text);
  let requiredExp = expMatch ? parseInt(expMatch[1]) : 0;
  let expScore = 30;
  if (requiredExp > 0) {
    expScore = Math.min(30, (profile.experience / requiredExp) * 30);
  }

  return Math.round(skillScore + expScore);
}

// ------------------------
// Inject match bars inside cards
// ------------------------
function injectMatchBars(profile) {
  document.querySelectorAll(".job-card, .base-card, .job_seen_beacon").forEach(jobCard => {
    if (jobCard.dataset.aiProcessed) return;
    jobCard.dataset.aiProcessed = "true";

    let text = jobCard.innerText;
    let score = calculateMatch(text, profile);

    let bar = document.createElement("div");
    bar.innerHTML = `
      <div style="margin-top:5px; font-size:12px; color:#444">
        AI Match Score: <b>${score}%</b>
        <div style="background:#eee; width:100%; height:6px; border-radius:3px; overflow:hidden;">
          <div style="width:${score}%; height:100%; background:${score>70?'#4caf50':'#ff9800'}"></div>
        </div>
      </div>`;
    jobCard.appendChild(bar);
  });
}

// ------------------------
// Create floating overlay with job list
// ------------------------
function createOverlay(profile) {
  let overlay = document.getElementById("aiJobOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "aiJobOverlay";
    overlay.style = `
      position: fixed; top: 10px; right: 10px;
      width: 300px; max-height: 90%; overflow-y: auto;
      background: white; border: 1px solid #ccc;
      padding: 10px; z-index: 9999; box-shadow: 0 0 10px #aaa;
      font-family: sans-serif;
    `;
    document.body.appendChild(overlay);
  }

  // Clear old entries before re-adding
  overlay.innerHTML = "<h3 style='margin-top:0'>AI Job Matches</h3>";

  document.querySelectorAll(".job-card, .base-card, .job_seen_beacon").forEach(jobCard => {
    let text = jobCard.innerText;
    let score = calculateMatch(text, profile);

    let jobTitle =
      jobCard.querySelector("h3, h2, .job-title")?.innerText ||
      "Job Posting";

    let jobItem = document.createElement("div");
    jobItem.style = "margin-bottom:10px; padding:5px; border-bottom:1px solid #eee";
    jobItem.innerHTML = `
      <b>${jobTitle}</b>
      <p>Match: ${score}%</p>
      <button class="applyBtn" style="padding:4px 8px; font-size:12px; cursor:pointer;">
        Apply
      </button>
    `;
    jobItem.querySelector(".applyBtn").addEventListener("click", () => {
      jobCard.scrollIntoView({ behavior: "smooth", block: "center" });
      autofillJob(profile); // call autofill
    });
    overlay.appendChild(jobItem);
  });
}

// ------------------------
// Auto-fill stub (replace with real autofill logic)
// ------------------------
// Autofill logic
function autofillJob(profile) {
  console.log("Autofilling with profile:", profile);

  const mappings = {
    firstName: profile.name.split(" ")[0],
    lastName: profile.name.split(" ")[1] || "",
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
  };

  for (let key in mappings) {
    let value = mappings[key];
    if (!value) continue;

    let input = document.querySelector(
      `input[name*="${key}"], input[id*="${key}"], input[placeholder*="${key}"],
       textarea[name*="${key}"], textarea[id*="${key}"], textarea[placeholder*="${key}"],
       select[name*="${key}"], select[id*="${key}"]`
    );

    if (input) {
      input.value = value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      console.log(`Filled ${key} → ${value}`);
    }
  }

  let emailField = document.querySelector("input[type='email']");
  if (emailField && !emailField.value) emailField.value = profile.email;

  let phoneField = document.querySelector("input[type='tel']");
  if (phoneField && !phoneField.value) phoneField.value = profile.phone;

  const form = document.querySelector("form");
  if (form) {
    setTimeout(() => form.requestSubmit ? form.requestSubmit() : form.submit(), 1500);
  }
}


// ------------------------
// Run extension logic
// ------------------------
chrome.storage.local.get("profile", ({ profile }) => {
  if (!profile) return;

  // Refresh match bars
  setInterval(() => injectMatchBars(profile), 3000);

  // Refresh overlay job list
  setInterval(() => createOverlay(profile), 5000);
});

// Watch for new fields appearing dynamically (like login popups)
const observer = new MutationObserver(() => {
  chrome.storage.local.get("profile", ({ profile }) => {
    if (profile) {
      autofillJob(profile); // Try autofilling whenever new DOM changes
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });
