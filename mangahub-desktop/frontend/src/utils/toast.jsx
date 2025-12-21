export function showToast(text) {
  const t = document.createElement("div");
  t.innerText = text;
  t.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    background: #020617;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 9999;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 5000);
}