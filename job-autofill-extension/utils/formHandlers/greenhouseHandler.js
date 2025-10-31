export async function fillGreenhouseForm(data) {
  console.log("🧩 Filling Greenhouse form...");

  // Helper to fill text fields
  const fillField = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
  };

  // Example field mappings (expand later)
  fillField("input[name='first_name']", data.firstName);
  fillField("input[name='last_name']", data.lastName);
  fillField("input[name='email']", data.email);
  fillField("input[name*='phone']", data.phone);
  fillField("input[name*='location']", data.location);

  // Resume upload
  const resumeInput = document.querySelector("input[type='file']");
  if (resumeInput && data.resumePath) {
    const file = await fetch(chrome.runtime.getURL(data.resumePath)).then(r => r.blob());
    const fileObj = new File([file], "resume.pdf", { type: "application/pdf" });
    const dt = new DataTransfer();
    dt.items.add(fileObj);
    resumeInput.files = dt.files;
    resumeInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Example dropdown handling
  const select = document.querySelector("select[name='education']");
  if (select) {
    select.value = data.education || "";
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // Scroll and handle “Next” or “Continue”
  const nextBtn = document.querySelector("button[type='submit'], button:contains('Next'), button:contains('Continue')");
  if (nextBtn) {
    const confirm = window.confirm("Review before submitting?");
    if (confirm) nextBtn.click();
  }

  console.log("✅ Greenhouse form filled.");
}
