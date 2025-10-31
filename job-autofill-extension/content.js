window.addEventListener("message", async (event) => {
  if (event.data.action === "startFilling") {
    const selectedSite = event.data.selectedSite;
    const detectedSite = window.siteName || "unknown";

    const siteToUse = selectedSite !== "auto" ? selectedSite : detectedSite;
    console.log("📍 Using site:", siteToUse);

    chrome.storage.local.get([`profile_${siteToUse}`], async (result) => {
      const data = result[`profile_${siteToUse}`];

      if (!data) {
        alert(`No JSON found for ${siteToUse}. Please upload from popup.`);
        return;
      }

      switch (siteToUse) {
        case "greenhouse":
          const { fillGreenhouseForm } = await import(chrome.runtime.getURL("utils/formHandlers/greenhouseHandler.js"));
          fillGreenhouseForm(data);
          break;

        default:
          alert(`Unsupported site (${siteToUse}). Add handler file first.`);
      }
    });
  }
});
