chrome.runtime.onInstalled.addListener(() => {
  console.log("🎯 Job Autofill Pro installed and ready.");
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === "log") console.log("[Job Autofill]", req.message);
  sendResponse({ ok: true });
});
