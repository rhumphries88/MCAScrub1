import React, { useState } from 'react';
import { UploadArea } from './UploadArea';
import { ResultsDisplay } from './ResultsDisplay';
import { UploadedFile, AnalysisResult } from '../types';

export const DocumentAnalyzer: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      setAnalysisResult({
        status: 'error',
        message: 'Please upload at least one file to analyze',
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      
      uploadedFiles.forEach((file, index) => {
        const byteString = atob(file.data.split(',')[1]);
        const mimeType = file.data.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], { type: mimeType });
        formData.append(`file${index}`, blob, file.name);
      });

      // Add previous analysis result if it exists
      if (hasAnalyzed && analysisResult?.data) {
        formData.append('previousAnalysis', JSON.stringify({
          rawText: analysisResult.data,
          timestamp: new Date().toISOString()
        }));
      }

      // Resolve and validate webhook URL from environment
      const webhookUrlRaw = import.meta.env.VITE_WEBHOOK_URL as string | undefined;
      const webhookUrl = webhookUrlRaw?.trim();

      if (!webhookUrl) {
        console.error('Missing VITE_WEBHOOK_URL. Please set it in your environment (.env.local)');
        throw new Error(
          'Configuration error: VITE_WEBHOOK_URL is not set. Please create an .env.local file with VITE_WEBHOOK_URL="http://<your-api>/analyze" and restart the dev server.'
        );
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      // Get the error response body if available
      let errorDetail = '';
      if (!response.ok) {
        try {
          const errorBody = await response.json();
          errorDetail = JSON.stringify(errorBody);
        } catch {
          try {
            errorDetail = await response.text();
          } catch {
            errorDetail = 'No error details available';
          }
        }

        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorDetail
        });

        throw new Error(
          `API error (${response.status}): ${response.statusText}. ` +
          `Please try again. If the problem persists, contact support.`
        );
      }

      const contentType = response.headers.get('content-type');
      let result: AnalysisResult;
      
      if (contentType && contentType.includes('application/json')) {
        const jsonData = await response.json();
        result = {
          status: 'success',
          message: 'Analysis completed successfully',
          data: jsonData
        };
      } else {
        const textData = await response.text();
        try {
          const jsonData = JSON.parse(textData);
          result = {
            status: 'success',
            message: 'Analysis completed successfully',
            data: jsonData
          };
        } catch {
          result = {
            status: 'success',
            message: 'Analysis completed successfully',
            data: { rawResponse: textData }
          };
        }
      }
      
      setAnalysisResult(result);
      setHasAnalyzed(true);
      // Clear uploaded files after successful analysis
      setUploadedFiles([]);
    } catch (error) {
      console.error('Error analyzing documents:', error);
      
      // Provide a more user-friendly error message
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while analyzing the documents. Please try again later.';
      
      setAnalysisResult({
        status: 'error',
        message: errorMessage,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setAnalysisResult(null);
    setHasAnalyzed(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 xl:col-span-4">
        <UploadArea 
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          onClearAll={clearAllFiles}
          hasAnalyzed={hasAnalyzed}
        />
      </div>
      
      <div className="lg:col-span-7 xl:col-span-8">
        <ResultsDisplay 
          isAnalyzing={isAnalyzing} 
          analysisResult={analysisResult} 
        />
      </div>
    </div>
  );
};