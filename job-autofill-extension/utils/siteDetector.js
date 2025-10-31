function detectSite() {
  const url = window.location.href;
  if (url.includes("greenhouse.io")) return "greenhouse";
  if (url.includes("myworkdayjobs.com")) return "workday";
  if (url.includes("rippling.com")) return "rippling";
  return "careerPage";
}

window.siteName = detectSite();
