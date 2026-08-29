import { CapturedMedia, FilterId } from "../types";

/**
 * Applies filter canvas context styling matching the CSS filters
 */
function applyCanvasFilter(ctx: CanvasRenderingContext2D, filterId: FilterId, brightness: number = 100, contrast: number = 100) {
  let filterString = `brightness(${brightness}%) contrast(${contrast}%)`;

  switch (filterId) {
    case "coffee":
      // filter-coffee-glow: sepia(0.35) saturate(1.4) contrast(1.1) brightness(1.05) hue-rotate(-10deg)
      filterString += ` sepia(35%) saturate(140%) contrast(110%) brightness(105%) hue-rotate(-10deg)`;
      break;
    case "nightlife":
      // filter-nightlife-neon: saturate(1.8) contrast(1.25) brightness(1.05) hue-rotate(15deg)
      filterString += ` saturate(180%) contrast(125%) brightness(105%) hue-rotate(15deg)`;
      break;
    case "selfie":
      // filter-selfie-soft: brightness(1.1) contrast(0.95) saturate(1.2)
      filterString += ` brightness(110%) contrast(95%) saturate(120%)`;
      break;
    case "foodie":
      // filter-foodie-pop: saturate(1.65) contrast(1.2) brightness(1.05)
      filterString += ` saturate(165%) contrast(120%) brightness(105%)`;
      break;
    case "retro":
      // filter-moment-retro: sepia(0.45) contrast(1.15) brightness(0.95) saturate(1.1)
      filterString += ` sepia(45%) contrast(115%) brightness(95%) saturate(110%)`;
      break;
    case "sky":
      // filter-sky-bright: saturate(1.5) contrast(1.15) brightness(1.1) hue-rotate(-5deg)
      filterString += ` saturate(150%) contrast(115%) brightness(110%) hue-rotate(-5deg)`;
      break;
    default:
      break;
  }

  ctx.filter = filterString;
}

/**
 * Converts a CapturedMedia photo into a rendered high-resolution Blob with filters applied
 */
export async function renderFilteredImageBlob(media: CapturedMedia): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 1080;
        canvas.height = img.naturalHeight || 1920;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        // Apply filters
        applyCanvasFilter(ctx, media.filterId, media.brightness, media.contrast);

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to render canvas to blob"));
            }
          },
          "image/jpeg",
          0.92
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (e) => reject(new Error("Failed to load image for rendering"));
    img.src = media.url;
  });
}

/**
 * Returns a shareable/downloadable File object from CapturedMedia
 */
export async function getMediaFile(media: CapturedMedia): Promise<File> {
  const timestamp = Date.now();
  if (media.type === "video") {
    try {
      const response = await fetch(media.url);
      const blob = await response.blob();
      const mimeType = blob.type || "video/mp4";
      const ext = mimeType.includes("webm") ? "webm" : "mp4";
      return new File([blob], `quickstatus-video-${timestamp}.${ext}`, { type: mimeType });
    } catch {
      // Fallback
      return new File([], `quickstatus-video-${timestamp}.mp4`, { type: "video/mp4" });
    }
  } else {
    try {
      const blob = await renderFilteredImageBlob(media);
      return new File([blob], `quickstatus-photo-${timestamp}.jpg`, { type: "image/jpeg" });
    } catch (e) {
      // Fallback to direct fetch
      const response = await fetch(media.url);
      const blob = await response.blob();
      return new File([blob], `quickstatus-photo-${timestamp}.jpg`, { type: blob.type || "image/jpeg" });
    }
  }
}

/**
 * Triggers direct download of the processed media file to local device storage / gallery
 */
export async function downloadMediaFile(media: CapturedMedia): Promise<string> {
  const file = await getMediaFile(media);
  const blobUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  return file.name;
}

export interface ShareResult {
  success: boolean;
  method: "native_file" | "native_text" | "downloaded_fallback";
  fileName?: string;
  message: string;
}

/**
 * Shares media with BOTH actual file binary (Photo/Video) and caption text
 */
export async function shareMediaWithFile(media: CapturedMedia): Promise<ShareResult> {
  // 1. Prepare actual file binary
  let file: File | null = null;
  try {
    file = await getMediaFile(media);
  } catch (err) {
    console.warn("Could not generate file binary, proceeding with fallback", err);
  }

  // 2. Test native Web Share API with files
  if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: "QuickStatus - Status Harian",
        text: media.caption,
        files: [file],
      });
      return {
        success: true,
        method: "native_file",
        fileName: file.name,
        message: "Foto/Video dan caption berhasil dikirimkan via menu berbagi!",
      };
    } catch (err: any) {
      if (err.name === "AbortError") {
        return {
          success: false,
          method: "native_file",
          message: "Proses berbagi dibatalkan.",
        };
      }
      console.warn("navigator.share with files failed, trying text share or download", err);
    }
  }

  // 3. Fallback: Automatically download file to Gallery + Copy caption to clipboard
  try {
    const downloadedName = await downloadMediaFile(media);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(media.caption);
    }
    return {
      success: true,
      method: "downloaded_fallback",
      fileName: downloadedName,
      message: `File foto/video tersimpan di galeri & caption telah disalin! Siap dipasang di status/story.`,
    };
  } catch (err: any) {
    return {
      success: false,
      method: "downloaded_fallback",
      message: "Gagal memproses file media: " + (err?.message || "Unknown error"),
    };
  }
}
