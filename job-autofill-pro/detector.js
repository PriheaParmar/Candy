const detectPlatform = () => {
  const url = window.location.href;
  if (url.includes("greenhouse.io")) return { platform: "greenhouse", page: detectGreenhousePage(url) };
  if (url.includes("lever.co")) return { platform: "lever", page: detectLeverPage(url) };
  if (url.includes("myworkdayjobs.com")) return { platform: "workday", page: detectWorkdayPage(url) };
  return { platform: null, page: null };
};

const detectGreenhousePage = (url) => {
  if (url.includes("/apply")) return "apply";
  if (url.includes("/confirmation")) return "confirmation";
  return "unknown";
};
