chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "searchJobs") {
    chrome.storage.local.get("profile", ({ profile }) => {
      if (!profile) return;

      const title = encodeURIComponent(msg.jobTitle || profile.skills[0]);
      const location = encodeURIComponent(profile.location || "United States");

      const urls = {
        glassdoor: `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${title}&locT=C&locId=1&locKeyword=${location}&fromAge=1`,
        linkedin: `https://www.linkedin.com/jobs/search?keywords=${title}&location=${location}`,
        indeed: `https://www.indeed.com/jobs?q=${title}&l=${location}`,
        simplyhired: `https://www.simplyhired.com/search?q=${title}&l=${location}`
      };

      // Open the selected portal
      chrome.tabs.create({ url: urls[msg.portal] });
    });
  }
});
