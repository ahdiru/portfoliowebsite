import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
}

/**
 * Converts the first page of a PDF file, Blob, ArrayBuffer, or URL into a clean high-resolution JPEG Data URL
 * @param {File | Blob | ArrayBuffer | string} source
 * @param {number} scale Default 2.0 for retina clarity
 * @returns {Promise<string>} Base64 data URL (image/jpeg)
 */
export async function convertPdfFirstPageToImage(source, scale = 2.0) {
  try {
    let docSource;

    if (typeof source === 'string') {
      if (source.startsWith('data:image/')) {
        return source;
      }
      docSource = { url: source };
    } else if (source instanceof Blob || (typeof File !== 'undefined' && source instanceof File)) {
      const buffer = await source.arrayBuffer();
      docSource = { data: buffer };
    } else if (source instanceof ArrayBuffer) {
      docSource = { data: source };
    } else {
      throw new Error('Unsupported source format for PDF conversion');
    }

    const loadingTask = pdfjsLib.getDocument(docSource);
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(1);

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background before rendering
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (error) {
    console.error('Failed to convert PDF to clean image:', error);
    throw error;
  }
}
