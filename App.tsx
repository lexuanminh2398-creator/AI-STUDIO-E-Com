import React, { useState, useMemo, useEffect } from 'react';
import { Mode, ImageFile } from './types';
import { changeBackground, virtualTryOn, editWithText, generate3DRender } from './services/geminiService';
import { processFinalImage, convertToWebP } from './utils/imageProcessor';
import ImageUploader from './components/ImageUploader';
import ModeSelector from './components/ModeSelector';
import ColorPalette from './components/ColorPalette';
import ResultDisplay from './components/ResultDisplay';

function App() {
  // Removed hasApiKey state and related logic as per user request for a free app without API key selection.
  const [mode, setMode] = useState<Mode>(Mode.Model);
  const [mainImage, setMainImage] = useState<ImageFile | null>(null);
  const [modelImage, setModelImage] = useState<ImageFile | null>(null); // Used for try-on mode
  const [backgroundColor, setBackgroundColor] = useState<string>('#f5f5dc');
  const [textPrompt, setTextPrompt] = useState<string>('');
  const [refinementPrompt, setRefinementPrompt] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Removed useEffect and handleSelectKey related to API key selection.

  // Dynamically change the uploader label based on the selected mode
  const uploaderLabel = useMemo(() => {
    switch (mode) {
      case Mode.Model: return "Upload Model Photo";
      case Mode.Flatlay: return "Upload Flatlay Photo";
      case Mode.TryOn: return "Upload Garment Photo";
      case Mode.AIEdit: return "Upload Image to Edit";
      case Mode.Render3D: return "Upload Product for 3D Render";
      case Mode.ConvertToWebP: return "Upload Image to Convert";
      default: return "Upload Image";
    }
  }, [mode]);

  // Determine if the generate button should be disabled
  const isGenerateDisabled = useMemo(() => {
    if (isLoading) return true;
    if (mode === Mode.TryOn) {
      return !mainImage || !modelImage;
    }
    if (!mainImage) return true;
    if (mode === Mode.AIEdit && !textPrompt.trim()) return true;
    return false;
  }, [isLoading, mainImage, modelImage, mode, textPrompt]);
  
  // Text for the primary action button
  const actionText = useMemo(() => {
    if (mode === Mode.ConvertToWebP) return 'Convert';
    return 'Generate Image';
  }, [mode]);
  
  // Text for the loading state
  const loadingText = useMemo(() => {
    if (mode === Mode.ConvertToWebP) return 'Converting...';
    return 'Generating...';
  }, [mode]);

  // Determine if the refinement section should be shown
  const showRefinement = useMemo(() => {
    if (!resultImage || isLoading) return false;
    const refinableModes = [
      Mode.Model,
      Mode.Flatlay,
      Mode.TryOn,
      Mode.AIEdit,
      Mode.Render3D,
    ];
    return refinableModes.includes(mode);
  }, [resultImage, isLoading, mode]);
  
  // Placeholder text for the refinement prompt
  const refinementPlaceholder = useMemo(() => {
    switch (mode) {
      case Mode.TryOn:
        return "e.g., 'Make the sleeves shorter' or 'Change the material to silk'";
      case Mode.Render3D:
        return "e.g., 'Show more texture on the fabric' or 'Make the lighting brighter'";
      case Mode.AIEdit:
        return "e.g., 'Now make it black and white' or 'Add a vintage feel'";
      case Mode.Model:
      case Mode.Flatlay:
        return "e.g., 'Make the shadow softer' or 'The background color is too dark'";
      default:
        return "Describe what you want to change...";
    }
  }, [mode]);

  // Centralized error handling for API responses
  const handleError = (err: any) => {
    console.error(err);
    const msg = err instanceof Error ? err.message : String(err);
    // Simplified error handling: no more API key selection/reset
    setError(`An error occurred: ${msg}. Please try again.`);
  };

  // Main handler for initiating image generation or conversion
  const handleGenerate = async () => {
    if (isGenerateDisabled) return; // Prevent multiple clicks or invalid state

    setIsLoading(true);
    setError(null);
    setResultImage(null); // Clear previous result

    try {
      if (mode === Mode.ConvertToWebP) {
        if (!mainImage) throw new Error("Please upload an image to convert.");
        const webpImage = await convertToWebP(mainImage.dataURL);
        setResultImage(webpImage);
      } else {
        let generatedImageBase64: string | null = null;
        switch (mode) {
          case Mode.Model:
            if (!mainImage) throw new Error("Please upload a model photo.");
            generatedImageBase64 = await changeBackground(mainImage, backgroundColor, 'model');
            break;
          case Mode.Flatlay:
            if (!mainImage) throw new Error("Please upload a flatlay photo.");
            generatedImageBase64 = await changeBackground(mainImage, backgroundColor, 'product');
            break;
          case Mode.TryOn:
            if (!mainImage || !modelImage) throw new Error("Please upload both garment and model photos.");
            generatedImageBase64 = await virtualTryOn(mainImage, modelImage);
            break;
          case Mode.AIEdit:
            if (!mainImage) throw new Error("Please upload an image to edit.");
            if (!textPrompt.trim()) throw new Error("Please provide an edit instruction.");
            generatedImageBase64 = await editWithText(mainImage, textPrompt);
            break;
          case Mode.Render3D:
            if (!mainImage) throw new Error("Please upload a product photo.");
            generatedImageBase64 = await generate3DRender(mainImage);
            break;
          default:
            throw new Error("Invalid mode selected for generation.");
        }
        
        if (generatedImageBase64) {
          const finalImage = await processFinalImage(generatedImageBase64);
          setResultImage(finalImage);
        } else {
          throw new Error("The AI failed to generate an image or returned an empty response.");
        }
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for refining an existing generated image
  const handleRefine = async () => {
    if (!resultImage || !refinementPrompt.trim() || isLoading) return; // Ensure there's a result and a prompt

    setIsLoading(true);
    setError(null);
    try {
      // Create a temporary ImageFile object from the current result image for refinement
      const currentImageFile: ImageFile = { 
        name: 'result_for_refinement.jpg', 
        dataURL: resultImage,
        mimeType: 'image/jpeg', 
      };
      const refinedImageBase64 = await editWithText(currentImageFile, refinementPrompt);
      if (refinedImageBase64) {
        const finalImage = await processFinalImage(refinedImageBase64);
        setResultImage(finalImage);
        setRefinementPrompt(''); // Clear refinement prompt after successful refinement
      } else {
        throw new Error("The AI failed to refine the image or returned an empty response.");
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Resets state when the mode changes
  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setResultImage(null);
    setError(null);
    setMainImage(null);
    setModelImage(null);
    setTextPrompt('');
    setBackgroundColor('#f5f5dc'); // Reset background color
    setRefinementPrompt('');
  }

  // Removed the conditional rendering for hasApiKey check. The main app UI is always rendered.

  // Main application UI
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <header className="bg-gray-800 p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-center">E-com Studio AI <span className="text-xs bg-blue-600 px-2 py-0.5 rounded text-white align-middle ml-2">Flash</span></h1>
      </header>
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 p-6">
        {/* Controls Column */}
        <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-lg flex flex-col gap-6 h-fit">
          <ModeSelector selectedMode={mode} onModeChange={handleModeChange} />
          
          {mode === Mode.TryOn ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ImageUploader 
                image={mainImage} 
                onImageUpload={setMainImage} 
                onClear={() => setMainImage(null)}
                label="Upload Garment"
              />
              <ImageUploader 
                image={modelImage} 
                onImageUpload={setModelImage} 
                onClear={() => setModelImage(null)}
                label="Upload Model"
              />
            </div>
          ) : (
            <ImageUploader 
              image={mainImage} 
              onImageUpload={setMainImage} 
              onClear={() => setMainImage(null)}
              label={uploaderLabel}
            />
          )}
          
          {(mode === Mode.Model || mode === Mode.Flatlay) && (
            <ColorPalette color={backgroundColor} onColorChange={setBackgroundColor} />
          )}

          {mode === Mode.AIEdit && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-300">Edit Instruction</h3>
              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                placeholder="e.g., 'Add a retro filter' or 'Make the background a beautiful beach'"
                className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={3}
              />
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full py-3 px-4 text-lg font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? loadingText : actionText}
          </button>
          {error && <p className="text-red-400 text-center">{error}</p>}
        </div>

        {/* Result Column */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <ResultDisplay image={resultImage} isLoading={isLoading} showPostProcessingText={false} />
          {showRefinement && (
            <div className="bg-gray-800/50 p-4 rounded-lg flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-gray-300">Refine Result</h3>
              <textarea
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  placeholder={refinementPlaceholder}
                  className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  rows={2}
              />
              <div className="flex gap-4">
                  <button
                      onClick={handleRefine}
                      disabled={!refinementPrompt.trim() || isLoading}
                      className="flex-1 py-2 px-4 text-md font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-white"
                  >
                      Refine
                  </button>
                  <button
                      onClick={handleGenerate} // This button triggers a re-generation of the *initial* task
                      disabled={isLoading}
                      className="flex-1 py-2 px-4 text-md font-bold rounded-lg transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                      Regenerate
                  </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;