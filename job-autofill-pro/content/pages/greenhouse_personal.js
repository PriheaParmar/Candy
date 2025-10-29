import { fillField } from "../autofill.js";

export async function handlePage(profile) {
  console.log("👤 Filling personal details (Greenhouse)...");
  fillField("#first_name", profile.firstName);
  fillField("#last_name", profile.lastName);
  fillField("#email", profile.email);
  fillField("#phone", profile.phone);
  fillField('input[name="job_application[location]"]', profile.city);
  fillField('input[name="job_application[address]"]', profile.address);
  return true;
}
