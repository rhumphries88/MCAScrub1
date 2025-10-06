import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, FileText, X, Clipboard } from 'lucide-react';
import { UploadedFile } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { processPdf } from '../utils/pdfProcessor';
import { useToast } from '../hooks/toastContext';

interface UploadAreaProps {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  onClearAll: () => void;
  hasAnalyzed: boolean;
}

export const UploadArea: React.FC<UploadAreaProps> = ({ 
  uploadedFiles, 
  setUploadedFiles, 
  isAnalyzing, 
  onAnalyze, 
  onClearAll,
  hasAnalyzed
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = async (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.type.includes('pdf')) {
        try {
          toast({
            title: "Processing PDF",
            description: `Extracting pages from ${file.name}...`
          });
          
          const extractedImages = await processPdf(file);
          
          setUploadedFiles(prev => [...prev, ...extractedImages]);
          
          toast({
            title: "Success",
            description: `Extracted ${extractedImages.length} pages from PDF`
          });
        } catch (error) {
          console.error('Error processing PDF:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to process PDF file"
          });
        }
      } else if (file.type.includes('image')) {
        addImageFromFile(file);
      } else {
        toast({
          variant: "destructive",
          title: "Unsupported file",
          description: `${file.name} is not a supported file type`
        });
      }
    }
  };
  
  const addImageFromFile = useCallback((file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const imageData = e.target.result as string;
        const newFile: UploadedFile = {
          id: generateId(),
          name: file.name,
          data: imageData,
          url: imageData,
          type: 'image'
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      }
    };
    
    reader.readAsDataURL(file);
  }, [setUploadedFiles]);

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };
  
  const focusForPaste = () => {
    document.addEventListener('paste', handlePaste);
    
    toast({
      title: "Ready for paste",
      description: "Press Ctrl+V or Cmd+V to paste your screenshot"
    });
    
    setTimeout(() => {
      document.removeEventListener('paste', handlePaste);
    }, 10000);
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.items) {
      const items = e.clipboardData.items;
      
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            addImageFromFile(blob);
            
            toast({
              title: "Image pasted",
              description: "Screenshot added to documents"
            });
            
            document.removeEventListener('paste', handlePaste);
          }
        }
      }
    }
  };
  
  useEffect(() => {
    const globalPasteHandler = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.items) {
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              addImageFromFile(blob);
              
              toast({
                title: "Image pasted",
                description: "Screenshot added to documents"
              });
            }
          }
        }
      }
    };
    
    document.addEventListener('paste', globalPasteHandler);
    
    return () => {
      document.removeEventListener('paste', globalPasteHandler);
    };
  }, [addImageFromFile, toast]);
  
  return (
    <Card className="overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100">
        <h2 className="text-xl font-medium flex items-center text-gray-900">
          <Upload className="mr-3 h-6 w-6 text-blue-600" />
          Upload Documents
        </h2>
      </div>
      
      <div className="p-8">
        <div
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer 
            transition-all duration-200 ease-in-out
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            multiple
            accept="image/*,application/pdf"
          />
          
          <FileText className="h-14 w-14 mx-auto mb-4 text-blue-500/70" />
          <p className="text-base font-medium mb-2 text-gray-700">
            Drag & drop documents or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Supports images and PDF documents
          </p>
        </div>
        
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={focusForPaste}
            className="text-sm flex items-center"
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Paste Screenshot
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="text-sm"
            disabled={uploadedFiles.length === 0 && !hasAnalyzed}
          >
            Clear All
          </Button>
        </div>
        
        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-medium mb-4 flex items-center">
              <span className="text-gray-700">
                Documents ({uploadedFiles.length})
              </span>
            </h3>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {uploadedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100 group hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center overflow-hidden">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden mr-3 border border-gray-300">
                      <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm truncate text-gray-700">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <Button
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white transition-colors text-base py-3"
              onClick={onAnalyze}
              disabled={isAnalyzing || uploadedFiles.length === 0}
              isLoading={isAnalyzing}
              loadingText="Analyzing..."
            >
              {hasAnalyzed ? 'Analyze More Documents' : 'Analyze Documents'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};