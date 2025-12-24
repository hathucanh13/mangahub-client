// Simple toast notification system with click support

let toastContainer = null;
let toastId = 0;

function getOrCreateContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, options = {}) {
  const { duration = 4000, onClick } = options;
  
  const container = getOrCreateContainer();
  const id = toastId++;

  const toast = document.createElement("div");
  toast.id = `toast-${id}`;
  toast.textContent = message;
  toast.style.cssText = `
    padding: 16px 24px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 240, 245, 0.95) 100%);
    backdrop-filter: blur(12px);
    border: 2px solid rgba(255, 182, 185, 0.5);
    border-radius: 50px;
    color: #ff6b9d;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(255, 182, 185, 0.4);
    animation: slideIn 0.3s ease-out;
    pointer-events: auto;
    ${onClick ? 'cursor: pointer; transition: transform 0.2s ease;' : ''}
    max-width: 400px;
    word-wrap: break-word;
  `;

  // Add hover effect if clickable
  if (onClick) {
    toast.addEventListener("mouseenter", () => {
      toast.style.transform = "scale(1.05)";
      toast.style.boxShadow = "0 12px 32px rgba(255, 182, 185, 0.5)";
    });
    toast.addEventListener("mouseleave", () => {
      toast.style.transform = "scale(1)";
      toast.style.boxShadow = "0 8px 24px rgba(255, 182, 185, 0.4)";
    });
    toast.addEventListener("click", () => {
      onClick();
      removeToast(id);
    });
  }

  container.appendChild(toast);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
}

function removeToast(id) {
  const toast = document.getElementById(`toast-${id}`);
  if (toast) {
    toast.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }
}

// Add animation styles
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);