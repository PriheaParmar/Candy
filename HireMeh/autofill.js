chrome.storage.local.get("profile", ({ profile }) => {
  if (!profile) return;

  const fields = {
    "firstName": profile.name.split(" ")[0],
    "lastName": profile.name.split(" ")[1] || "",
    "email": profile.email,
    "phone": profile.phone,
    "location": profile.location
  };

  for (let key in fields) {
    let input = document.querySelector(`input[name*="${key}"]`);
    if (input) input.value = fields[key];
  }

  // Auto-submit if a form exists
  const form = document.querySelector("form");
  if (form) {
    setTimeout(() => form.submit(), 1000); // wait 1s for values to populate
  }
});
