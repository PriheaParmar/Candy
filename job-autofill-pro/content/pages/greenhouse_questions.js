import { fillField } from "../autofill.js";

export async function handlePage(profile) {
  console.log("🧾 Answering questions (Greenhouse)...");
  fillField('input[placeholder*="salary"]', profile.salary);
  fillField('input[placeholder*="LinkedIn"]', profile.linkedin);
  fillField('input[placeholder*="GitHub"]', profile.github);
  return true;
}
