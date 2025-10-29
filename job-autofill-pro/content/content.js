chrome.runtime.onMessage.addListener(async (req, sender, sendResponse) => {
  console.log("📩 Message received:", req);

  if (req.action === "startFilling") {
    console.log("🚀 Start Filling triggered manually...");
    const { profiles, resumes } = await chrome.storage.local.get(["profiles", "resumes"]);
    const { detectPlatform } = await import(chrome.runtime.getURL("content/detector.js"));
    const { runWorkflow } = await import(chrome.runtime.getURL("content/workflow.js"));

    const { platform } = detectPlatform();
    console.log("🧭 Detected platform:", platform);

    const profile = profiles?.[platform] || profiles?.default;
    const resume = resumes?.[platform] || resumes?.default;

    if (!profile) {
      console.warn("⚠️ No profile found for this site.");
      sendResponse({ success: false });
      return;
    }

    await runWorkflow(profile, resume);
    console.log("✅ Workflow completed successfully.");
    sendResponse({ success: true });
  }
});
