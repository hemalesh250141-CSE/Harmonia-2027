/**
 * Client-side HTML5 Canvas image compressor targeting < 150 KB output
 * to ensure rapid uploads under high concurrency and Firestore 1MB safety.
 */
export interface CompressedImageResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
}

export async function compressImageToUnder150KB(
  file: File,
  maxBytes = 145_000
): Promise<CompressedImageResult> {
  const originalBytes = file.size;

  const dataUrlFromFile = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read selected image file.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Invalid or unsupported image format.'));
    image.src = dataUrlFromFile;
  });

  let maxDim = 1280;
  let quality = 0.84;
  let outputUrl = '';
  let outW = img.width;
  let outH = img.height;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable in this browser.');
  }

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    outW = Math.max(1, Math.round(img.width * scale));
    outH = Math.max(1, Math.round(img.height * scale));
    canvas.width = outW;
    canvas.height = outH;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outW, outH);
    ctx.drawImage(img, 0, 0, outW, outH);

    outputUrl = canvas.toDataURL('image/jpeg', quality);
    if (outputUrl.length <= maxBytes) {
      break;
    }
    quality = Math.max(0.42, quality - 0.1);
    maxDim = Math.round(maxDim * 0.8);
  }

  if (outputUrl.length > 200_000) {
    throw new Error('Image could not be compressed under 150 KB. Please choose a clearer smaller screenshot.');
  }

  const approxBytes = Math.round((outputUrl.length * 3) / 4);

  return {
    dataUrl: outputUrl,
    originalBytes,
    compressedBytes: approxBytes,
    width: outW,
    height: outH,
  };
}

/**
 * Compresses official event posters preserving full aspect ratio (no cropping)
 * while targeting <= 450 KB so Firestore/Express storage stays fast.
 */
export async function compressPosterImage(
  file: File,
  maxBytes = 550_000
): Promise<CompressedImageResult> {
  const originalBytes = file.size;

  const dataUrlFromFile = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read selected poster image file.'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Invalid or unsupported poster image format.'));
    image.src = dataUrlFromFile;
  });

  let maxDim = 1600;
  let quality = 0.88;
  let outputUrl = '';
  let outW = img.width;
  let outH = img.height;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable in this browser.');
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    outW = Math.max(1, Math.round(img.width * scale));
    outH = Math.max(1, Math.round(img.height * scale));
    canvas.width = outW;
    canvas.height = outH;

    ctx.clearRect(0, 0, outW, outH);
    ctx.drawImage(img, 0, 0, outW, outH);

    outputUrl = canvas.toDataURL('image/webp', quality);
    if (!outputUrl.startsWith('data:image/webp')) {
      outputUrl = canvas.toDataURL('image/jpeg', quality);
    }
    if (outputUrl.length <= maxBytes) {
      break;
    }
    quality = Math.max(0.55, quality - 0.08);
    maxDim = Math.round(maxDim * 0.85);
  }

  if (outputUrl.length > 850_000) {
    throw new Error('Poster image is too large even after optimization. Please choose an image under 5 MB.');
  }

  return {
    dataUrl: outputUrl,
    originalBytes,
    compressedBytes: Math.round((outputUrl.length * 3) / 4),
    width: outW,
    height: outH,
  };
}
