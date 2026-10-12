export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_FILE_BYTES = 20 * 1024 * 1024;

export function validateImage(file: File): string | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const typeOk = ACCEPTED_TYPES.includes(file.type) || ["jpg", "jpeg", "png", "webp", "heic", "heif"].includes(ext);
  if (!typeOk) return "Only JPG, PNG, WebP or HEIC photos, please.";
  if (file.size > MAX_FILE_BYTES) return "This photo is larger than 20 MB.";
  return null;
}

async function decode(file: Blob): Promise<ImageBitmap | HTMLImageElement> {
  if ("createImageBitmap" in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall back to <img> decoding below */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function render(source: ImageBitmap | HTMLImageElement, maxSide: number, quality: number): Promise<Blob> {
  const w = "naturalWidth" in source ? source.naturalWidth : source.width;
  const h = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not compress"))), "image/jpeg", quality));
}

export interface Compressed {
  full: Blob; // ~1600px, quality 0.8
  medium: Blob; // ~1000px, used by the in-browser demo store to save space
  thumb: Blob; // ~480px for grids
}

/** Resizes a photo in the browser before upload so it works on slow wedding-hall networks. */
export async function compressImage(file: File): Promise<Compressed> {
  let source: ImageBitmap | HTMLImageElement;
  try {
    source = await decode(file);
  } catch {
    throw new Error(/heic|heif/i.test(file.type + file.name) ? "This browser can't read HEIC photos. Please choose JPG, or set your camera to 'Most compatible'." : "This file doesn't look like a photo we can read.");
  }
  const [full, medium, thumb] = await Promise.all([render(source, 1600, 0.8), render(source, 1000, 0.72), render(source, 480, 0.7)]);
  if ("close" in source) source.close();
  return { full, medium, thumb };
}
