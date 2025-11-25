import React from 'react';

interface ResultDisplayProps {
  image: string | null;
  isLoading: boolean;
  showPostProcessingText: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, isLoading, showPostProcessingText }) => {
  const handleDownload = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      // Changed extension to .jpg for Flash model output
      link.download = `ecom-studio-ai-result-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex-1 bg-gray-800/50 p-6 rounded-lg flex flex-col items-center justify-center relative min-h-[400px]">
      {isLoading ? (
        <div className="flex flex-col items-center text-gray-400">
          <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium">Processing...</p>
          {showPostProcessingText && (
             <p className="text-sm mt-2 text-gray-500">Generating Image...</p>
          )}
        </div>
      ) : image ? (
        <>
          <img src={image} alt="Generated Result" className="max-w-full max-h-[80vh] object-contain rounded-md shadow-lg" />
          <button
            onClick={handleDownload}
            className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 11.586V3a1 1 0 112 0v8.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Download JPG
          </button>
        </>
      ) : (
        <div className="text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-lg">Your generated image will appear here</p>
          <p className="text-sm">Upload images and select a mode to get started!</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;