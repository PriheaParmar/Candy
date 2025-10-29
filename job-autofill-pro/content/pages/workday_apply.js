import { fillField, uploadFile } from "../autofill.js";

export async function handlePage(profile, resume) {
  console.log("📅 Filling Workday Apply page...");
  await uploadFile('input[type="file"]', resume);
  fillField('input[name*="firstName"]', profile.firstName);
  fillField('input[name*="lastName"]', profile.lastName);
  fillField('input[type="email"]', profile.email);
  fillField('input[type="tel"]', profile.phone);
  console.log("✅ Workday fields filled.");
}
