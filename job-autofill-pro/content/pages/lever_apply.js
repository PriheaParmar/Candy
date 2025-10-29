import { fillField, uploadFile } from "../autofill.js";

export async function handlePage(profile, resume) {
  console.log("🎚️ Filling Lever Apply page...");
  await uploadFile('input[type="file"]', resume);
  fillField('input[name="name"]', profile.fullName || `${profile.firstName} ${profile.lastName}`);
  fillField('input[name="email"]', profile.email);
  fillField('input[name="phone"]', profile.phone);
  fillField('input[name="location"]', profile.city);
  console.log("✅ Lever fields filled.");
}
