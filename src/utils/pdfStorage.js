/**
 * Robust IndexedDB storage for offline & large presentation PDFs.
 * Bypasses localStorage 5MB quota limit by using browser IndexedDB (multi-gigabyte storage).
 */

const DB_NAME = "portfolio_db";
const STORE_NAME = "pdf_presentations";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Stores a PDF File or Blob in IndexedDB
 * @param {string} id Unique project or deck ID
 * @param {Blob | File} blob
 * @returns {Promise<boolean>}
 */
export async function savePdfToLocalDb(id, blob) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        id: String(id),
        blob,
        updatedAt: Date.now(),
      });

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to store PDF in IndexedDB:", err);
    return false;
  }
}

/**
 * Retrieves a PDF Blob from IndexedDB
 * @param {string} id
 * @returns {Promise<Blob | null>}
 */
export async function getPdfFromLocalDb(id) {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(String(id));

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to get PDF from IndexedDB:", err);
    return null;
  }
}

/**
 * Resolves a PDF URL or IndexedDB reference to a valid usable URL
 * @param {string} pdfRef
 * @returns {Promise<string>}
 */
export async function resolvePdfUrl(pdfRef) {
  if (!pdfRef) return "";
  if (pdfRef.startsWith("http://") || pdfRef.startsWith("https://") || pdfRef.startsWith("blob:")) {
    return pdfRef;
  }
  if (pdfRef.startsWith("indexeddb:")) {
    const id = pdfRef.replace("indexeddb:", "").trim();
    const blob = await getPdfFromLocalDb(id);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  }
  return pdfRef;
}
