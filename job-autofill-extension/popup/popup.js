document.getElementById("uploadBtn").addEventListener("click", async () => {
  const site = document.getElementById("siteSelect").value;
  if (site === "auto") {
    alert("Please select a site (like Greenhouse or Workday) before uploading JSON.");
    return;
  }

  const [fileHandle] = await window.showOpenFilePicker({
    types: [{ description: "JSON Files", accept: { "application/json": [".json"] } }]
  });
  const file = await fileHandle.getFile();
  const content = await file.text();
  const data = JSON.parse(content);

  chrome.storage.local.set({ [`profile_${site}`]: data }, () => {
    document.getElementById("status").innerText = `✅ ${site} JSON uploaded & saved.`;
  });
});

document.getElementById("startBtn").addEventListener("click", async () => {
  const siteSelection = document.getElementById("siteSelect").value;

  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (selectedSite) => {
        window.postMessage({ action: "startFilling", selectedSite }, "*");
      },
      args: [siteSelection]
    });
  });
});
