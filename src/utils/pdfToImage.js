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

const COMMON_TECH_KEYWORDS = [
  { name: "React.js", pattern: /\b(react|reactjs|react\.js)\b/i },
  { name: "Next.js", pattern: /\b(next|nextjs|next\.js)\b/i },
  { name: "Vue.js", pattern: /\b(vue|vuejs|vue\.js)\b/i },
  { name: "Tailwind CSS", pattern: /\b(tailwind|tailwind css|tailwindcss)\b/i },
  { name: "Python", pattern: /\b(python|py)\b/i },
  { name: "PostgreSQL", pattern: /\b(postgres|postgresql|psql)\b/i },
  { name: "Supabase", pattern: /\b(supabase)\b/i },
  { name: "Tableau", pattern: /\b(tableau)\b/i },
  { name: "Power BI", pattern: /\b(power bi|powerbi)\b/i },
  { name: "Looker Studio", pattern: /\b(looker studio|google data studio|looker)\b/i },
  { name: "SQL", pattern: /\b(sql|mysql|sqlite)\b/i },
  { name: "Pandas", pattern: /\b(pandas)\b/i },
  { name: "NumPy", pattern: /\b(numpy)\b/i },
  { name: "Scikit-Learn", pattern: /\b(scikit[\s-]?learn|sklearn)\b/i },
  { name: "Excel", pattern: /\b(microsoft excel|ms excel|excel)\b/i },
  { name: "Data Analytics", pattern: /\b(data analytics|data analysis|analisis data|data analyst)\b/i },
  { name: "Data Visualization", pattern: /\b(data visualization|visualisasi data)\b/i },
  { name: "Machine Learning", pattern: /\b(machine learning|deep learning|ai)\b/i },
  { name: "Figma", pattern: /\b(figma)\b/i },
  { name: "UI/UX Design", pattern: /\b(ui[\s/_-]?ux|user interface|user experience|desain ui[\s/_-]?ux)\b/i },
  { name: "Node.js", pattern: /\b(node|nodejs|node\.js)\b/i },
  { name: "Express.js", pattern: /\b(express|expressjs|express\.js)\b/i },
  { name: "TypeScript", pattern: /\b(typescript|ts)\b/i },
  { name: "JavaScript", pattern: /\b(javascript|js|es6)\b/i },
  { name: "Docker", pattern: /\b(docker)\b/i },
  { name: "REST API", pattern: /\b(rest api|restful api|api)\b/i },
  { name: "Git", pattern: /\b(git|github|gitlab)\b/i },
];

/**
 * Extracts metadata, slide text, tech stack, links, and cover image from a presentation PDF
 * @param {File | Blob} file
 */
export async function extractPdfPresentationDetails(file) {
  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    let metaTitle = "";
    try {
      const meta = await pdfDoc.getMetadata();
      if (meta?.info?.Title && meta.info.Title.trim().length > 3) {
        metaTitle = meta.info.Title.trim();
      }
    } catch (e) {}

    // Extract text from the first 3 pages (cover, overview & architecture)
    const textLines = [];
    const maxScan = Math.min(numPages, 4);

    for (let p = 1; p <= maxScan; p++) {
      try {
        const page = await pdfDoc.getPage(p);
        const textContent = await page.getTextContent();
        textContent.items.forEach((item) => {
          const str = (item.str || "").trim();
          if (str && str.length > 1) {
            textLines.push(str);
          }
        });
      } catch (e) {}
    }

    const fullText = textLines.join(" ");

    // 1. Detect Title
    let detectedTitle = metaTitle;
    if (!detectedTitle) {
      // Find prominent candidate in the first 5 lines of slide 1
      const candidate = textLines.find(
        (line) =>
          line.length > 5 &&
          line.length < 90 &&
          !/^(halaman|page|slide|confidential|draft|presentasi|by|oleh|ahmad jordan)/i.test(line) &&
          !line.includes("http") &&
          !line.includes("@")
      );
      if (candidate) {
        detectedTitle = candidate;
      } else {
        // Fallback from filename
        detectedTitle = file.name
          .replace(/\.pdf$/i, "")
          .replace(/[_-]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
    }

    // 2. Detect Tech Stack
    const detectedTech = [];
    COMMON_TECH_KEYWORDS.forEach((tech) => {
      if (tech.pattern.test(fullText)) {
        if (!detectedTech.includes(tech.name)) {
          detectedTech.push(tech.name);
        }
      }
    });

    // 3. Render slide 1 as clean Cover Image
    const firstPage = await pdfDoc.getPage(1);
    const viewport = firstPage.getViewport({ scale: 2.2 });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await firstPage.render({ canvasContext: ctx, viewport }).promise;
    const coverImage = canvas.toDataURL("image/jpeg", 0.95);

    // 4. Detect Description snippet
    let detectedDescription = "";
    const descriptionCandidates = textLines.filter(
      (line) =>
        line.length > 25 &&
        line !== detectedTitle &&
        !line.includes("http") &&
        !line.includes("@") &&
        !/^(copyright|all rights|author|disusun oleh|presented by|halaman|page)/i.test(line)
    );
    if (descriptionCandidates.length > 0) {
      detectedDescription = descriptionCandidates.slice(0, 2).join(". ");
      if (!detectedDescription.endsWith(".")) detectedDescription += ".";
    }

    // 5. Detect Links (GitHub / Live URL) if present in text
    let detectedGithub = "";
    const ghMatch = fullText.match(/(?:https?:\/\/)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+/i);
    if (ghMatch) {
      detectedGithub = ghMatch[0].startsWith("http") ? ghMatch[0] : `https://${ghMatch[0]}`;
    }

    let detectedLive = "";
    const liveMatch = fullText.match(/(https?:\/\/(?!github\.com)[a-zA-Z0-9_.-]+\.(?:netlify\.app|vercel\.app|web\.app|app|io|com|id|org)[^\s,]*)/i);
    if (liveMatch) {
      detectedLive = liveMatch[1];
    }

    // 6. Detect Key Features candidates
    const detectedFeatures = [];
    textLines.forEach((line) => {
      if (/^[•\-–—*]\s*(.+)$/.test(line)) {
        const feat = line.replace(/^[•\-–—*]\s*/, "").trim();
        if (feat.length > 6 && feat.length < 60 && !detectedFeatures.includes(feat)) {
          detectedFeatures.push(feat);
        }
      }
    });

    return {
      numPages,
      detectedTitle,
      detectedTech,
      detectedDescription,
      detectedGithub,
      detectedLive,
      detectedFeatures: detectedFeatures.slice(0, 4),
      coverImage,
    };
  } catch (error) {
    console.error("Failed to parse presentation PDF:", error);
    // Fallback if parsing text fails: still attempt cover image
    try {
      const coverImage = await convertPdfFirstPageToImage(file, 2.0);
      const cleanName = file.name
        .replace(/\.pdf$/i, "")
        .replace(/[_-]+/g, " ")
        .trim();
      return {
        numPages: 1,
        detectedTitle: cleanName,
        detectedTech: [],
        detectedDescription: "",
        detectedGithub: "",
        detectedLive: "",
        detectedFeatures: [],
        coverImage,
      };
    } catch (e) {
      throw error;
    }
  }
}
