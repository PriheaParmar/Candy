// content.js — waits for manual trigger to start filling workflow

import { runWorkflow } from "./workflow.js";
import { detectPlatform } from "./detector.js";

// Listen for message from popup.js
chrome.runtime.onMessage.addListener(async (req, sender, sendResponse) => {
  if (req.action === "startFilling") {
    console.log("🚀 Start Filling triggered manually...");

    // Load stored data
    const { profiles, resumes } = await chrome.storage.local.get(["profiles", "resumes"]);

    // Detect current platform
    const { platform } = detectPlatform();
    console.log("🧭 Detected platform:", platform);

    // Choose the right profile and resume
    const profile = profiles?.[platform] || profiles?.default;
    const resume = resumes?.[platform] || resumes?.default;

    if (!profile) {
      console.warn("⚠️ No profile found for this site. Please upload a JSON profile first.");
      sendResponse({ success: false, error: "No profile" });
      return;
    }

    try {
      // Run the main multi-step workflow
      await runWorkflow(profile, resume);
      console.log("✅ Workflow completed successfully.");
      sendResponse({ success: true });
    } catch (err) {
      console.error("❌ Workflow failed:", err);
      sendResponse({ success: false, error: err.message });
    }
  }
});
