import { setValue } from "../core/utils.js";

export async function fillWorkforceNow(profile) {
  console.log("Autofilling WorkforceNow form...");
  const map = {
    firstName: 'input[name="firstName"], input[id*="first"]',
    email: 'input[type="email"], input[name*="email"]',
    phone: 'input[type="tel"], input[name*="phone"], input[id*="mobile"]'
  };

  if (profile.firstName) setValue(document.querySelector(map.firstName), profile.firstName);
  if (profile.email) setValue(document.querySelector(map.email), profile.email);
  if (profile.phone) setValue(document.querySelector(map.phone), profile.phone);

  const submit = document.querySelector('button[type="submit"], input[type="submit"], button:contains("Submit")');
  if (submit) submit.scrollIntoView({ behavior: "smooth" });
}
