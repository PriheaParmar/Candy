export function fillField(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return false;
  const setter = Object.getOwnPropertyDescriptor(el.__proto__, "value")?.set;
  if (setter) setter.call(el, value);
  else el.value = value;
  ["input", "change", "blur"].forEach(e => el.dispatchEvent(new Event(e, { bubbles: true })));
  return true;
}

export async function uploadFile(selector, resume) {
  if (!resume) return false;
  const input = document.querySelector(selector);
  if (!input) return false;
  const res = await fetch(resume.data);
  const blob = await res.blob();
  const file = new File([blob], resume.name, { type: resume.type });
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}
