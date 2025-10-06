import React from 'react';
import { FileBarChart, AlertCircle, CheckCircle, Maximize, Download } from 'lucide-react';
import { Card } from './ui/Card';
import { AnalysisResult } from '../types';
import { formatAnalysisData } from '../utils/formatter';
import { useToast } from '../hooks/toastContext';
import html2pdf from 'html2pdf.js';

interface ResultsDisplayProps {
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ 
  isAnalyzing, 
  analysisResult 
}) => {
  const { toast } = useToast();
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleDownloadPDF = async () => {
    if (!contentRef.current || !analysisResult?.data) return;

    const opt = {
      margin: [5, 5],
      filename: 'financial-analysis.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        scrollY: -window.scrollY,
        width: 1600,
        windowWidth: 1600
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4',
        orientation: 'landscape',
        compress: true,
        precision: 16,
        putOnlyUsedFonts: true
      },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we prepare your document...",
      });

      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = `
        <div style="padding: 12px; font-family: Arial, sans-serif;">
          <h1 style="color: #1f2937; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
            Financial Analysis Report
          </h1>
          <div style="color: #374151; font-size: 12px;">
            ${formatAnalysisData(analysisResult.data)}
          </div>
        </div>
      `;

      // Add custom styles for PDF
      const style = document.createElement('style');
      style.textContent = `
        @page {
          size: A4 landscape;
          margin: 5mm;
        }
        table {
          width: 100% !important;
          max-width: none !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          margin: 8px 0 !important;
          page-break-inside: avoid !important;
          font-size: 10px !important;
        }
        table, th, td {
          border: 1px solid #e5e7eb !important;
        }
        th {
          background: #f3f4f6 !important;
          padding: 6px !important;
          text-align: left !important;
          font-weight: bold !important;
          color: #1f2937 !important;
          white-space: normal !important;
          word-wrap: break-word !important;
        }
        td {
          padding: 6px !important;
          vertical-align: top !important;
          color: #374151 !important;
          word-wrap: break-word !important;
        }
        tr:nth-child(even) {
          background-color: #f9fafb !important;
        }
        h2 {
          color: #1f2937 !important;
          font-size: 16px !important;
          margin: 16px 0 8px 0 !important;
          page-break-before: auto !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding-bottom: 6px !important;
        }
        h3 {
          color: #374151 !important;
          font-size: 14px !important;
          margin: 12px 0 8px 0 !important;
        }
        p {
          margin: 6px 0 !important;
          line-height: 1.4 !important;
        }
        ul {
          margin: 6px 0 !important;
          padding-left: 16px !important;
        }
        li {
          margin: 3px 0 !important;
          line-height: 1.3 !important;
        }
        .analysis-report {
          max-width: none !important;
          width: 100% !important;
          overflow-x: visible !important;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      `;
      tempContainer.appendChild(style);

      await html2pdf().set(opt).from(tempContainer).save();

      toast({
        title: "Success",
        description: "PDF has been downloaded successfully",
        variant: "success"
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className={`${isFullScreen ? 'fixed inset-0 z-50 rounded-none' : 'h-full'}`}>
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-xl font-medium flex items-center text-gray-900">
          <FileBarChart className="mr-3 h-6 w-6 text-blue-600" />
          Analysis Results
        </h2>
      </div>
      
      <div className="p-8">
        {!analysisResult && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <FileBarChart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-3">No Analysis Yet</h3>
            <p className="text-gray-500 max-w-md text-base">
              Upload documents and click "Analyze" to see financial insights and MCA indicators.
            </p>
          </div>
        )}
        
        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6">
              <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-3">Analyzing Documents</h3>
            <p className="text-gray-500 max-w-md text-base">
              Please wait while we process your documents and generate insights...
            </p>
          </div>
        )}
        
        {analysisResult && !isAnalyzing && (
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              {analysisResult.status === 'success' ? (
                <div className="flex items-center text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 mr-3" />
                  <span className="font-medium text-base">Analysis completed successfully</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-6 w-6 mr-3" />
                  <span className="font-medium text-base">{analysisResult.message}</span>
                </div>
              )}
            </div>
            
            {analysisResult.data && (
              <div className="relative">
                <div className="absolute top-4 right-4 z-10 flex gap-3">
                  <button
                    className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    onClick={handleDownloadPDF}
                    title="Download PDF"
                  >
                    <Download className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    className="p-3 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    onClick={toggleFullScreen}
                    title={isFullScreen ? "Exit Full Screen" : "View Full Screen"}
                  >
                    <Maximize className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                
                <div 
                  ref={contentRef}
                  className={`
                    bg-gray-50 p-8 rounded-xl border border-gray-200 overflow-auto 
                    text-base analysis-result-container
                    ${isFullScreen ? 'h-[calc(100vh-200px)]' : 'max-h-[600px]'}
                  `}
                  dangerouslySetInnerHTML={{ __html: formatAnalysisData(analysisResult.data) }}
                ></div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};