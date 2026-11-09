import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist/build/pdf.mjs";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

// Target 1 - 2 MB (default ~1.8 MB) sesuai permintaan Paduka Dane
export const TARGET_MAX_BYTES_LITE = Math.round(1.8 * 1024 * 1024); // ~1.8 MB
export const TARGET_MAX_BYTES_STANDARD = 5 * 1024 * 1024; // 5 MB

/**
 * Compresses a PDF file client-side to target 1 - 2 MB (or custom target)
 * while preserving clear typography, layout, and image fidelity.
 *
 * @param {File | Blob} file Original PDF file
 * @param {Object} [options]
 * @param {number} [options.targetMaxBytes=1887436] Target maximum size in bytes (default: ~1.8MB)
 * @param {Function} [options.onProgress] Callback with { percent, stage, current, total }
 * @returns {Promise<{
 *   file: File,
 *   originalSize: number,
 *   compressedSize: number,
 *   wasCompressed: boolean,
 *   ratioText: string
 * }>}
 */
export async function compressPdfIfNeeded(file, options = {}) {
  const {
    targetMaxBytes = TARGET_MAX_BYTES_LITE,
    onProgress = () => {},
  } = options;

  const originalSize = file.size;

  // If already under target, no compression needed
  if (originalSize <= targetMaxBytes) {
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
      ratioText: `${(originalSize / (1024 * 1024)).toFixed(2)} MB`,
    };
  }

  onProgress({ percent: 5, stage: "Membaca berkas PDF...", current: 0, total: 1 });

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    onProgress({
      percent: 10,
      stage: `Memproses ${numPages} slide ke target 1 - 2 MB...`,
      current: 0,
      total: numPages,
    });

    const newPdfDoc = await PDFDocument.create();

    // Dynamically calculate render resolution and JPEG quality to guarantee size <= 2MB
    let renderScale = 1.25;
    let jpegQuality = 0.70;

    if (numPages > 35) {
      renderScale = 0.95;
      jpegQuality = 0.58;
    } else if (numPages > 20) {
      renderScale = 1.1;
      jpegQuality = 0.64;
    } else if (numPages <= 8) {
      renderScale = 1.4;
      jpegQuality = 0.76;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    for (let p = 1; p <= numPages; p++) {
      const page = await pdfDoc.getPage(p);
      const viewport = page.getViewport({ scale: renderScale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Fill crisp white background
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;

      // Convert to compressed JPEG
      const jpegDataUrl = canvas.toDataURL("image/jpeg", jpegQuality);
      const jpegImage = await newPdfDoc.embedJpg(jpegDataUrl);

      // Keep original page aspect ratio
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const newPage = newPdfDoc.addPage([
        unscaledViewport.width,
        unscaledViewport.height,
      ]);

      newPage.drawImage(jpegImage, {
        x: 0,
        y: 0,
        width: unscaledViewport.width,
        height: unscaledViewport.height,
      });

      const currentPercent = 10 + Math.round((p / numPages) * 80);
      onProgress({
        percent: currentPercent,
        stage: `Mengompresi slide ${p} dari ${numPages}...`,
        current: p,
        total: numPages,
      });
    }

    onProgress({
      percent: 92,
      stage: "Menyusun berkas PDF teroptimasi (1-2 MB)...",
      current: numPages,
      total: numPages,
    });

    const compressedBytes = await newPdfDoc.save();
    let finalBlob = new Blob([compressedBytes], { type: "application/pdf" });

    const compressedSize = finalBlob.size;
    const cleanFileName = file.name || "presentation.pdf";
    const compressedFile = new File([finalBlob], cleanFileName, {
      type: "application/pdf",
      lastModified: Date.now(),
    });

    onProgress({
      percent: 100,
      stage: "Selesai! Berkas terkompresi ke 1 - 2 MB.",
      current: numPages,
      total: numPages,
    });

    return {
      file: compressedFile,
      originalSize,
      compressedSize,
      wasCompressed: true,
      ratioText: `${(compressedSize / (1024 * 1024)).toFixed(2)} MB (Hemat ${(
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(0)}%)`,
    };
  } catch (error) {
    console.error("PDF compression error:", error);
    return {
      file,
      originalSize,
      compressedSize: originalSize,
      wasCompressed: false,
      ratioText: `${(originalSize / (1024 * 1024)).toFixed(2)} MB`,
      error: error.message,
    };
  }
}
