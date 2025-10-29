import { fillField, uploadFile } from "../autofill.js";

export async function handlePage(profile, resume) {
  console.log("🏢 Filling Greenhouse Apply page...");
  await uploadFile('input[type="file"][id*="resume"]', resume);
  fillField("#first_name", profile.firstName);
  fillField("#last_name", profile.lastName);
  fillField("#email", profile.email);
  fillField("#phone", profile.phone);
  fillField('input[name="job_application[location]"]', profile.city);
  console.log("✅ Greenhouse fields filled.");
}
