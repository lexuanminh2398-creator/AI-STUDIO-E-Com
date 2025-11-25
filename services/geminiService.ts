import { GoogleGenAI, Part } from '@google/genai';
import { ImageFile } from '../types';
import { dataURLtoBase64 } from '../utils/imageProcessor';

/**
 * Helper function to instantiate GoogleGenAI, ensuring the API key is always up-to-date.
 */
function getGeminiClient(): GoogleGenAI {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable is not set. Please ensure it is configured.');
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

/**
 * Converts an ImageFile object into a Gemini API `Part` object suitable for `inlineData`.
 * @param imageFile The ImageFile object.
 * @returns A Part object with inlineData.
 */
function imageFileToInlinePart(imageFile: ImageFile): Part {
  return {
    inlineData: {
      mimeType: imageFile.mimeType,
      data: dataURLtoBase64(imageFile.dataURL),
    },
  };
}

/**
 * Base function to call the Gemini model for image generation/editing tasks.
 * It handles error parsing and extracting the image from the response.
 * @param contents The content parts to send to the model.
 * @param model The model name to use.
 * @returns A promise that resolves with the base64 encoded image string, or null if no image is found.
 */
async function callGeminiImageModel(contents: (string | Part)[], model: string = 'gemini-2.5-flash-image'): Promise<string | null> {
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: contents },
      config: {
        // Configure for Image Generation
        imageConfig: {
          // imageSize is not supported by gemini-2.5-flash-image, so we only set aspectRatio
          aspectRatio: '1:1', // Standard square aspect ratio
        }
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error('No image found in the Gemini API response.');
  } catch (error: any) {
    console.error('Error in callGeminiImageModel:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini API error: ${errorMessage}. Please check your API key.`);
  }
}

/**
 * Changes the background of an uploaded image to a specified color.
 * @param image The main image file.
 * @param newColor The desired background color (e.g., '#FFFFFF').
 * @param type The type of subject ('model' or 'product').
 * @returns A promise that resolves with the base64 encoded string of the processed image.
 */
export async function changeBackground(image: ImageFile, newColor: string, type: 'model' | 'product'): Promise<string> {
  const prompt = `Change the background of this ${type} image to a smooth, elegant ${newColor} color. Ensure the subject is perfectly cut out and naturally lit, with soft shadows.`;
  return callGeminiImageModel([imageFileToInlinePart(image), { text: prompt }]);
}

/**
 * Performs a virtual try-on, placing a garment onto a model.
 * @param garmentImage The image of the garment.
 * @param modelImage The image of the model.
 * @returns A promise that resolves with the base64 encoded string of the processed image.
 */
export async function virtualTryOn(garmentImage: ImageFile, modelImage: ImageFile): Promise<string> {
  const prompt = 'Place the garment from the second image onto the model in the first image. Make it look realistic, with proper draping, lighting, and shadows. Ensure the garment fits the model naturally.';
  return callGeminiImageModel([imageFileToInlinePart(modelImage), imageFileToInlinePart(garmentImage), { text: prompt }]);
}

/**
 * Edits an image based on a text prompt.
 * @param image The image to edit.
 * @param textPrompt The text instruction for the edit.
 * @returns A promise that resolves with the base64 encoded string of the edited image.
 */
export async function editWithText(image: ImageFile, textPrompt: string): Promise<string> {
  return callGeminiImageModel([imageFileToInlinePart(image), { text: textPrompt }]);
}

/**
 * Generates a high-quality 3D-like render of a product from an input image.
 * @param image The product image.
 * @returns A promise that resolves with the base64 encoded string of the rendered image.
 */
export async function generate3DRender(image: ImageFile): Promise<string> {
  const prompt = 'Create a professional "ghost mannequin" effect. The clothing item must appear to be worn by an invisible body, retaining a perfect 3D volume and shape. The mannequin must be COMPLETELY INVISIBLE. Show the hollow interior (e.g., inside the neck label area) to create a sense of depth. Front-facing view on a clean white background. High detailed fabric texture, natural draping, and soft studio lighting. No visible skin, no hands, no head, no stands.';
  return callGeminiImageModel([imageFileToInlinePart(image), { text: prompt }]);
}