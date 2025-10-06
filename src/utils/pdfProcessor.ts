import { UploadedFile } from '../types';

// Declare global PDF.js types
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

// Load PDF.js library
const loadPdfJsLibrary = async (): Promise<void> => {
  if (window.pdfjsLib) return;
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve();
    };
    
    script.onerror = () => reject(new Error('Failed to load PDF.js library'));
    
    document.body.appendChild(script);
  });
};

// Generate a unique ID for uploaded files
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Process PDF file and extract pages as images
export const processPdf = async (file: File): Promise<UploadedFile[]> => {
  try {
    await loadPdfJsLibrary();
    
    if (!window.pdfjsLib) {
      throw new Error('PDF.js library not loaded');
    }
    
    // Load the PDF file
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    
    const extractedImages: UploadedFile[] = [];
    
    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      // Get the page
      const page = await pdf.getPage(pageNum);
      
      // Set scale for rendering
      const viewport = page.getViewport({ scale: 1.5 });
      
      // Create a canvas for rendering
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Canvas context not available');
        continue;
      }
      
      // Set canvas dimensions to match the viewport
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      // Render the page to the canvas
      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;
      
      // Convert canvas to image data URL
      const imageData = canvas.toDataURL('image/png');
      const pageName = `${file.name.replace('.pdf', '')}_page_${pageNum}.png`;
      
      // Create a file object
      const newFile: UploadedFile = {
        id: generateId(),
        name: pageName,
        data: imageData,
        url: imageData,
        type: 'pdf-page'
      };
      
      extractedImages.push(newFile);
    }
    
    return extractedImages;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};