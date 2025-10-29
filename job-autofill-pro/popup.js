document.addEventListener("DOMContentLoaded", async () => {
  const saved = await chrome.storage.local.get(["profiles", "resumes", "geminiKey"]);
  if (saved.profiles) document.getElementById("status").textContent = "✓ Profiles loaded";
  if (saved.geminiKey) document.getElementById("geminiKey").value = saved.geminiKey;
});

document.getElementById("profileUpload").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  try {
    const profile = JSON.parse(text);
    const name = file.name.toLowerCase();
    let platform = "default";
    if (name.includes("greenhouse")) platform = "greenhouse";
    else if (name.includes("lever")) platform = "lever";
    else if (name.includes("workday")) platform = "workday";
    const { profiles = {} } = await chrome.storage.local.get("profiles");
    profiles[platform] = profile;
    await chrome.storage.local.set({ profiles });
    document.getElementById("status").textContent = `Profile for ${platform} saved`;
  } catch {
    document.getElementById("status").textContent = "❌ Invalid JSON file";
  }
});

document.getElementById("resumeUpload").addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    const base64 = ev.target.result;
    const name = file.name.toLowerCase();
    let platform = "default";
    if (name.includes("greenhouse")) platform = "greenhouse";
    else if (name.includes("lever")) platform = "lever";
    else if (name.includes("workday")) platform = "workday";
    const { resumes = {} } = await chrome.storage.local.get("resumes");
    resumes[platform] = { name: file.name, type: file.type, data: base64 };
    await chrome.storage.local.set({ resumes });
    document.getElementById("status").textContent = `Resume for ${platform} saved`;
  };
  reader.readAsDataURL(file);
});

document.getElementById("geminiKey").addEventListener("change", async e => {
  await chrome.storage.local.set({ geminiKey: e.target.value });
  document.getElementById("status").textContent = "Gemini key saved";
});

// 🔘 START FILLING BUTTON
document.getElementById("startBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  try {
    console.log("🔹 Injecting content.js into", tab.url);

    // Inject first
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content/content.js"]
    });

    // Wait a moment so listener is ready
    await new Promise(r => setTimeout(r, 800));

    // Send start signal
    chrome.tabs.sendMessage(tab.id, { action: "startFilling" }, res => {
      if (chrome.runtime.lastError) {
        console.error("⚠️ sendMessage error:", chrome.runtime.lastError.message);
        document.getElementById("status").textContent = "❌ Could not connect. Try again.";
      } else if (res?.success) {
        document.getElementById("status").textContent = "✅ Filling started...";
      } else {
        document.getElementById("status").textContent = "⚠️ No profile or script issue.";
      }
    });
  } catch (err) {
    console.error("❌ Injection failed:", err);
    document.getElementById("status").textContent = "❌ Injection failed";
  }
});

