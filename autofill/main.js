(async () => {
  const site = prompt("Which site are you applying on? (e.g., greenhouse, workforcenow, workday, rippling)");
  if (!site) return alert("No site entered.");

  const profile = await getProfile(); // read from storage or injected JSON

  switch (site.toLowerCase()) {
    case "greenhouse":
      await import("./sites/greenhouse.js").then(m => m.fillGreenhouse(profile));
      break;

    case "workforcenow":
      await import("./sites/workforcenow.js").then(m => m.fillWorkforceNow(profile));
      break;

    case "workday":
      await import("./sites/workday.js").then(m => m.fillWorkday(profile));
      break;

    case "rippling":
      await import("./sites/rippling.js").then(m => m.fillRippling(profile));
      break;

    default:
      alert("Unknown site. Using generic autofill instead.");
      await import("./core/autofill-core.js").then(m => m.autofillGeneric(profile));
      break;
  }
})();
