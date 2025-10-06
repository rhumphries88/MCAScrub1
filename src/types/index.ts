// Basic file structure for uploads
export interface UploadedFile {
  id: string;
  name: string;
  data: string;
  url: string;
  type: 'image' | 'pdf-page';
}

// Analysis result structure
export interface AnalysisResult {
  status: 'success' | 'error';
  message: string;
  data?: any;
}