export function detectPlatform() {
  const url = window.location.href;
  if (url.includes("greenhouse.io")) return { platform: "greenhouse", page: detectGreenhousePage(url) };
  if (url.includes("lever.co")) return { platform: "lever", page: detectLeverPage(url) };
  if (url.includes("myworkdayjobs.com")) return { platform: "workday", page: detectWorkdayPage(url) };
  return { platform: null, page: null };
}

function detectGreenhousePage(url) {
  if (url.includes("/apply")) return "apply";
  if (url.includes("/confirmation")) return "confirmation";
  return "unknown";
}

function detectLeverPage(url) {
  if (url.includes("/apply")) return "apply";
  return "unknown";
}

function detectWorkdayPage(url) {
  if (url.includes("Job") || url.includes("apply")) return "apply";
  return "unknown";
}
