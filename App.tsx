import React, { useState, useCallback } from 'react';
import { ImageFile } from './types';
import { remixImage } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { Spinner, RemixIcon, ErrorIcon, DownloadIcon } from './components/Icons';

export default function App() {
  const [image1, setImage1] = useState<ImageFile | null>(null);
  const [image2, setImage2] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = image1 && image2 && prompt.trim().length > 0 && !isLoading;

  const handleGenerate = useCallback(async () => {
    if (!canGenerate) return;

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    setGeneratedText(null);

    try {
      if (!image1 || !image2) {
        throw new Error("Both images must be provided.");
      }
      const result = await remixImage(image1.file, image2.file, prompt);
      
      if (result.imageUrl) {
        setGeneratedImage(result.imageUrl);
      } else {
        throw new Error("The AI did not return an image. Please try a different prompt or images.");
      }
      setGeneratedText(result.text);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [image1, image2, prompt, canGenerate]);

  const handleReset = () => {
    setImage1(null);
    setImage2(null);
    setPrompt('');
    setGeneratedImage(null);
    setGeneratedText(null);
    setError(null);
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'remix-ai-generated.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-2">
            <RemixIcon className="w-12 h-12 text-brand-blue" />
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-white">Remix AI</h1>
          </div>
          <p className="text-lg text-gray-400">Combine two images and a prompt to create something new.</p>
        </header>

        <main className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ImageUploader title="First Image" onImageUpload={setImage1} image={image1} disabled={isLoading} />
            <ImageUploader title="Second Image" onImageUpload={setImage2} image={image2} disabled={isLoading} />
            <div className="bg-brand-light-dark p-6 rounded-2xl shadow-lg flex flex-col gap-4 md:col-span-2 lg:col-span-1">
              <h2 className="text-xl font-semibold text-white">3. Add your prompt</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A majestic cat king wearing a golden crown, sitting on a throne made of clouds, in a vibrant pop-art style..."
                className="w-full flex-grow bg-brand-gray border border-gray-600 rounded-xl p-4 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-brand-blue focus:outline-none transition duration-200 resize-none"
                rows={6}
                disabled={isLoading}
              ></textarea>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-blue text-white font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-5 h-5" />
                  Generating...
                </>
              ) : (
                <>
                  <RemixIcon className="w-5 h-5" />
                  Generate Remix
                </>
              )}
            </button>
             <button
                onClick={handleReset}
                className="w-full sm:w-auto text-gray-400 hover:text-white transition-colors py-2 px-6"
              >
                Start Over
              </button>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-xl flex items-center gap-3 mt-4">
              <ErrorIcon className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold">Generation Failed</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {generatedImage && (
            <div className="mt-8 bg-brand-light-dark p-6 rounded-2xl shadow-lg animate-fade-in">
              <h2 className="text-2xl font-bold mb-4 text-white text-center">Your Remix</h2>
              <div className="flex justify-center">
                <img src={generatedImage} alt="AI generated remix" className="rounded-xl max-w-full h-auto max-h-[60vh] object-contain shadow-2xl" />
              </div>
              {generatedText && (
                 <p className="text-gray-300 mt-4 text-center bg-brand-gray p-4 rounded-xl">{generatedText}</p>
              )}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out hover:bg-gray-600 transform hover:scale-105"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download Image
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}