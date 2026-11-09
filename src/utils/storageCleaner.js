/**
 * Safe LocalStorage Manager with automatic quota recovery & cache cleaning
 */

export function cleanLocalStorageQuota() {
  if (typeof window === "undefined" || !window.localStorage) return;

  try {
    const keysToCheck = [
      "portfolio_local_projects",
      "projects",
      "portfolio_local_certificates",
      "certificates",
    ];

    keysToCheck.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (!raw) return;

      // If key is unusually large (> 250KB), sanitize its objects
      if (raw.length > 250 * 1024) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const cleaned = parsed.map((item) => {
              const safe = { ...item };
              // Strip giant base64 data URLs
              if (typeof safe.Img === "string" && safe.Img.startsWith("data:") && safe.Img.length > 80000) {
                safe.Img = "";
              }
              if (Array.isArray(safe.Features)) {
                safe.Features = safe.Features.filter(
                  (f) => typeof f !== "string" || !f.startsWith("__pdf:data:")
                );
              }
              if (typeof safe.pdfUrl === "string" && safe.pdfUrl.startsWith("data:")) {
                safe.pdfUrl = "";
              }
              if (typeof safe.PdfUrl === "string" && safe.PdfUrl.startsWith("data:")) {
                safe.PdfUrl = "";
              }
              return safe;
            });
            localStorage.setItem(key, JSON.stringify(cleaned));
          }
        } catch (e) {
          // If corrupted, remove
          localStorage.removeItem(key);
        }
      }
    });
  } catch (err) {
    console.warn("Storage auto-clean notice:", err);
  }
}

/**
 * Safely writes to localStorage without ever crashing the app on QuotaExceededError
 * @param {string} key
 * @param {any} value
 * @returns {boolean}
 */
export function safeSetLocalStorage(key, value) {
  if (typeof window === "undefined" || !window.localStorage) return false;

  const stringValue = typeof value === "string" ? value : JSON.stringify(value);

  try {
    localStorage.setItem(key, stringValue);
    return true;
  } catch (err) {
    console.warn(`localStorage quota exceeded for key "${key}". Initiating recovery...`, err);

    // 1. Clean giant items
    cleanLocalStorageQuota();

    try {
      localStorage.setItem(key, stringValue);
      return true;
    } catch (retryErr) {
      // 2. If value is an array, trim items or strip heavy fields
      try {
        if (typeof value !== "string" && Array.isArray(value)) {
          const trimmed = value.map((item) => ({
            ...item,
            Img: typeof item.Img === "string" && item.Img.startsWith("data:") ? "" : item.Img,
          }));
          localStorage.setItem(key, JSON.stringify(trimmed));
          return true;
        }
      } catch (finalErr) {
        console.error("Critical storage write failed:", finalErr);
      }
      return false;
    }
  }
}

// Automatically run on load
if (typeof window !== "undefined") {
  cleanLocalStorageQuota();
}
