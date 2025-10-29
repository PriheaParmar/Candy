// workflow.js – orchestrates step-by-step filling logic
import { detectPlatform } from "./detector.js";

export async function runWorkflow(profile, resume) {
  const { platform, page } = detectPlatform();
  if (!platform) return console.log("❌ Unsupported platform");

  console.log(`🧭 Starting workflow for ${platform} (${page})`);

  // Step map: each page type executed in sequence if found
  const steps = [
    `${platform}_upload`,
    `${platform}_personal`,
    `${platform}_questions`
  ];

  for (const step of steps) {
    try {
      const path = `content/pages/${step}.js`;
      const mod = await import(chrome.runtime.getURL(path));
      if (mod.handlePage) {
        console.log(`▶️ Running ${step}...`);
        const done = await mod.handlePage(profile, resume);
        if (done) console.log(`✅ Finished ${step}`);
      }
    } catch (err) {
      console.log(`⏭️ Skipping ${step} (not defined)`);
    }
  }

  console.log("🏁 Workflow complete!");
}
