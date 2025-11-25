/**
 * Converts a data URL (e.g., base64 image string) to a base64 string.
 * This removes the `data:image/png;base64,` prefix if present.
 * @param dataURL The data URL of the image.
 * @returns The base64 encoded string of the image.
 */
export function dataURLtoBase64(dataURL: string): string {
  const base64 = dataURL.split(',')[1];
  return base64;
}

/**
 * Converts an image Data URL to WebP format.
 * @param dataURL The Data URL of the image to convert.
 * @param quality The quality of the WebP image (0 to 1, default 0.8).
 * @returns A promise that resolves with the Data URL of the converted WebP image.
 */
export function convertToWebP(dataURL: string, quality: number = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Required for canvas operations on images from different origins
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Could not get 2D context from canvas."));
        return;
      }
      ctx.drawImage(img, 0, 0);
      try {
        const webpDataURL = canvas.toDataURL('image/webp', quality);
        resolve(webpDataURL);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => {
      reject(new Error(`Failed to load image for WebP conversion: ${e}`));
    };
    img.src = dataURL;
  });
}

/**
 * Processes a generated image (e.g., from an AI model) to ensure it's in a displayable format.
 * Updates: Returns JPEG for gemini-2.5-flash-image compatibility.
 * @param generatedImageBase64 The base64 string of the generated image (without the data URL prefix).
 * @returns A promise that resolves with the Data URL of the processed image (JPEG).
 */
export async function processFinalImage(generatedImageBase64: string): Promise<string> {
  // Return the JPEG data URL as Gemini Flash Image typically outputs JPEG.
  return `data:image/jpeg;base64,${generatedImageBase64}`;
}