import * as pdfjsLib from "pdfjs-dist";

// Set worker source to cloudflare CDN to avoid webpack/vite worker issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts the first page of a PDF file as a JPEG image.
 * @param file The PDF file object
 * @returns A promise resolving to a File object containing the JPEG image
 */
export async function extractFirstPageAsImage(file: File): Promise<File> {
  if (file.type !== "application/pdf") {
    throw new Error("File must be a PDF");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  // Render at a decent scale for a thumbnail
  const scale = 1.5; 
  const viewport = page.getViewport({ scale });

  // Create canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create canvas context");

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Render PDF page into canvas context
  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  await page.render(renderContext).promise;

  // Convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas to Blob failed"));
        return;
      }
      // Create a File object from the blob
      const imageName = file.name.replace(/\.pdf$/i, ".jpg");
      const imageFile = new File([blob], imageName, { type: "image/jpeg" });
      resolve(imageFile);
    }, "image/jpeg", 0.9); // 0.9 quality
  });
}
