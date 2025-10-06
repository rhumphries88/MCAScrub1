declare module 'html2pdf.js' {
  export interface Html2PdfOptions {
    margin?: number | number[];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: Record<string, unknown>;
    pagebreak?: Record<string, unknown>;
    [key: string]: unknown;
  }

  export interface Html2PdfWorker {
    set: (opt: Html2PdfOptions) => Html2PdfWorker;
    from: (source: HTMLElement | string) => Html2PdfWorker;
    save: (filename?: string) => Promise<void>;
    outputPdf?: () => Promise<Blob>;
  }

  function html2pdf(): Html2PdfWorker;
  export default html2pdf;
}
