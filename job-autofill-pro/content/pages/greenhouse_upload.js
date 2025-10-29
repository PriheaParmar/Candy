import { uploadFile } from "../autofill.js";

export async function handlePage(profile, resume) {
  console.log("📎 Uploading resume (Greenhouse)...");
  return await uploadFile('input[type="file"][id*="resume"]', resume);
}
