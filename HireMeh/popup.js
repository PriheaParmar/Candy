document.getElementById("profileForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const profile = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    location: document.getElementById("location").value,
    skills: document.getElementById("skills").value.split(",").map(s => s.trim()),
    experience: parseInt(document.getElementById("experience").value, 10)
  };

  const searchBtn = document.createElement("button");
searchBtn.textContent = "🔍 Find Jobs";
searchBtn.addEventListener("click", () => {
  const portal = "glassdoor"; // or let user select
  chrome.runtime.sendMessage({ action: "searchJobs", portal });
});
document.querySelector(".container").appendChild(searchBtn);

document.getElementById("searchJobs").addEventListener("click", () => {
  const portal = document.getElementById("portal").value;
  const jobTitle = document.getElementById("jobTitle").value;
  chrome.runtime.sendMessage({ action: "searchJobs", portal, jobTitle });
});


  chrome.storage.local.set({ profile }, () => {
    alert("✅ Profile saved successfully!");
  });
});


function createFloatingButton() {
  if (document.getElementById("aiAutofillButton")) return;

  const button = document.createElement("div");
  button.id = "aiAutofillButton";
  button.innerText = "⚡ Autofill";
  button.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 10px 15px;
    border-radius: 50px;
    cursor: pointer;
    font-weight: bold;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  `;
  button.onclick = () => {
    chrome.storage.local.get("profile", ({ profile }) => {
      if (profile) autofillJob(profile);
    });
  };

  document.body.appendChild(button);
}

// Run on page load
setTimeout(createFloatingButton, 2000);
