import { apiFetch } from '../api';

/**
 * Makes the smaller copies of a photograph that has just been uploaded.
 *
 * The shop serves its own resized images — Vercel's optimiser is not available
 * on this account — and those copies have to exist for every piece, including
 * the ones added next year. Doing it here, in the browser, means the shop never
 * has to think about it and no server has to run an image library.
 *
 * Deliberately quiet: a copy that fails to be made costs a little bandwidth on
 * the storefront, which falls back to the original. It must never be the reason
 * a product cannot be saved.
 */
const WIDTHS = [320, 640, 1080];

/** The key the Worker stores a photograph under, read back out of its URL. */
function keyFromUrl(url: string): string | null {
  const marker = '/api/images/';
  const at = url.indexOf(marker);
  return at === -1 ? null : decodeURIComponent(url.slice(at + marker.length));
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read that image'));
    img.src = URL.createObjectURL(file);
  });
}

async function resize(img: HTMLImageElement, width: number): Promise<Blob | null> {
  const scale = Math.min(1, width / img.naturalWidth);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.78));
}

export async function makeVariants(file: File, url: string): Promise<void> {
  const key = keyFromUrl(url);
  if (!key) return;

  try {
    const img = await loadImage(file);
    for (const width of WIDTHS) {
      const blob = await resize(img, width);
      if (!blob) continue;
      await apiFetch(`/api/images/variant/${width}/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/webp' },
        body: blob,
      });
    }
    URL.revokeObjectURL(img.src);
  } catch {
    // The storefront falls back to the original, so this is not worth a word
    // to someone who is in the middle of adding a product.
  }
}
